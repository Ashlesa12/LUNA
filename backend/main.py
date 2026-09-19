import hashlib
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import jwt as pyjwt
import pymongo
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

app = FastAPI(title="E-Commerce Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "luna")

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]

categories_coll = db["categories"]
products_coll = db["products"]
users_coll = db["users"]
counters_coll = db["counters"]
carts_coll = db["carts"]

SECRET_KEY = "aura-in-memory-secret-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

bearer_scheme = HTTPBearer(auto_error=False)


def next_id(collection: str) -> int:
    counter = counters_coll.find_one_and_update(
        {"_id": collection},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=pymongo.ReturnDocument.AFTER,
    )
    return counter["seq"]


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100_000
    ).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, digest = stored.split("$", 1)
    test = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100_000
    ).hex()
    return secrets.compare_digest(test, digest)


def create_access_token(user: dict) -> str:
    payload = {
        "sub": user["email"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return pyjwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def user_out(user: dict) -> dict:
    return {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def category_out(category: dict) -> dict:
    return {"id": category["_id"], "name": category["name"]}


def product_out(product: dict) -> dict:
    return {
        "id": product["_id"],
        "name": product["name"],
        "price": product["price"],
        "categoryId": product["categoryId"],
    }


def seed():
    if users_coll.count_documents({}) == 0:
        users_coll.insert_one(
            {
                "_id": next_id("users"),
                "name": "Store Admin",
                "email": "admin@store.com",
                "password_hash": hash_password("admin123"),
                "role": "admin",
            }
        )

    if categories_coll.count_documents({}) == 0:
        for name in ["Women", "Men", "Accessories"]:
            categories_coll.insert_one({"_id": next_id("categories"), "name": name})

    if products_coll.count_documents({}) == 0:
        category_ids = {
            c["name"]: c["_id"] for c in categories_coll.find()
        }
        seed_products = [
            {"name": "Linen Shirt", "price": 1599, "category": "Women"},
            {"name": "Silk Slip Dress", "price": 2499, "category": "Women"},
            {"name": "Denim Jacket", "price": 2199, "category": "Men"},
            {"name": "Cotton Tee", "price": 799, "category": "Men"},
            {"name": "Lunar Tote", "price": 1299, "category": "Accessories"},
            {"name": "Silk Scarf", "price": 899, "category": "Accessories"},
        ]
        for item in seed_products:
            products_coll.insert_one(
                {
                    "_id": next_id("products"),
                    "name": item["name"],
                    "price": item["price"],
                    "categoryId": category_ids[item["category"]],
                }
            )


seed()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
    except pyjwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = users_coll.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: str
    password: str


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)


class ProductIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    price: float = Field(default=0, ge=0)
    categoryId: int


class CartItemIn(BaseModel):
    productId: int
    quantity: int = Field(default=1, ge=1)


@app.post("/api/auth/register", status_code=201)
def register(payload: RegisterIn):
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if users_coll.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "_id": next_id("users"),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
    }
    users_coll.insert_one(user)
    return user_out(user)


@app.post("/api/auth/login")
def login(payload: LoginIn):
    email = payload.email.strip().lower()
    user = users_coll.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"],
        "email": user["email"],
    }


@app.get("/api/auth/me")
def me(user: dict = Depends(get_current_user)):
    return user_out(user)


@app.get("/api/admin/customers")
def list_customers(user: dict = Depends(require_admin)):
    return [user_out(u) for u in users_coll.find()]


@app.get("/api/categories")
def list_categories(user: dict = Depends(get_current_user)):
    return [category_out(c) for c in categories_coll.find().sort("_id")]


@app.post("/api/categories", status_code=201)
def create_category(
    payload: CategoryIn, user: dict = Depends(require_admin)
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    if categories_coll.find_one({"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}}):
        raise HTTPException(status_code=409, detail=f'Category "{name}" already exists')
    category = {"_id": next_id("categories"), "name": name}
    categories_coll.insert_one(category)
    return category_out(category)


@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(category_id: int, user: dict = Depends(require_admin)):
    result = categories_coll.delete_one({"_id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    products_coll.delete_many({"categoryId": category_id})


@app.get("/api/products")
def list_products(user: dict = Depends(get_current_user)):
    return [product_out(p) for p in products_coll.find().sort("_id")]


@app.post("/api/products", status_code=201)
def create_product(payload: ProductIn, user: dict = Depends(require_admin)):
    if not categories_coll.find_one({"_id": payload.categoryId}):
        raise HTTPException(status_code=400, detail="Selected category does not exist")
    product = {
        "_id": next_id("products"),
        "name": payload.name.strip(),
        "price": payload.price,
        "categoryId": payload.categoryId,
    }
    products_coll.insert_one(product)
    return product_out(product)


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: int, user: dict = Depends(require_admin)):
    result = products_coll.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")


def cart_items_for(user: dict) -> dict:
    entries = list(carts_coll.find({"userId": user["_id"]}).sort("_id"))
    items = []
    for entry in entries:
        product = products_coll.find_one({"_id": entry["productId"]})
        if not product:
            continue
        item = product_out(product)
        item["quantity"] = entry["quantity"]
        items.append(item)
    total = round(sum(i["price"] * i["quantity"] for i in items), 2)
    return {"items": items, "total": total}


@app.get("/api/cart")
def get_cart(user: dict = Depends(get_current_user)):
    return cart_items_for(user)


@app.post("/api/cart/items", status_code=201)
def add_to_cart(payload: CartItemIn, user: dict = Depends(get_current_user)):
    if not products_coll.find_one({"_id": payload.productId}):
        raise HTTPException(status_code=404, detail="Product not found")
    carts_coll.update_one(
        {"userId": user["_id"], "productId": payload.productId},
        {"$inc": {"quantity": payload.quantity}},
        upsert=True,
    )
    return cart_items_for(user)


@app.put("/api/cart/items/{product_id}")
def set_cart_quantity(
    product_id: int, payload: CartItemIn, user: dict = Depends(get_current_user)
):
    if not products_coll.find_one({"_id": product_id}):
        raise HTTPException(status_code=404, detail="Product not found")
    carts_coll.update_one(
        {"userId": user["_id"], "productId": product_id},
        {"$set": {"quantity": payload.quantity}},
        upsert=True,
    )
    return cart_items_for(user)


@app.delete("/api/cart/items/{product_id}", status_code=204)
def remove_from_cart(product_id: int, user: dict = Depends(get_current_user)):
    result = carts_coll.delete_one({"userId": user["_id"], "productId": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not in cart")