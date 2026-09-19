import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt as pyjwt
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

SECRET_KEY = "aura-in-memory-secret-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

bearer_scheme = HTTPBearer(auto_error=False)

categories = []

products = []

users = []

next_category_id = 1
next_product_id = 1
next_user_id = 2


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


users.append(
    {
        "id": 1,
        "name": "Store Admin",
        "email": "admin@store.com",
        "password_hash": hash_password("admin123"),
        "role": "admin",
    }
)


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
    user = next(
        (u for u in users if u["email"] == payload.get("sub")), None
    )
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


@app.post("/api/auth/register", status_code=201)
def register(payload: RegisterIn):
    global next_user_id
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if any(u["email"] == email for u in users):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "id": next_user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
    }
    next_user_id += 1
    users.append(user)
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}


@app.post("/api/auth/login")
def login(payload: LoginIn):
    user = next(
        (u for u in users if u["email"] == payload.email.strip().lower()), None
    )
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
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}


@app.get("/api/categories")
def list_categories(user: dict = Depends(get_current_user)):
    return categories


@app.post("/api/categories", status_code=201)
def create_category(
    payload: CategoryIn, user: dict = Depends(require_admin)
):
    global next_category_id
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    if any(c["name"].lower() == name.lower() for c in categories):
        raise HTTPException(status_code=409, detail=f'Category "{name}" already exists')
    category = {"id": next_category_id, "name": name}
    next_category_id += 1
    categories.append(category)
    return category


@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(category_id: int, user: dict = Depends(require_admin)):
    global categories, products
    if not any(c["id"] == category_id for c in categories):
        raise HTTPException(status_code=404, detail="Category not found")
    categories = [c for c in categories if c["id"] != category_id]
    products = [p for p in products if p["categoryId"] != category_id]


@app.get("/api/products")
def list_products(user: dict = Depends(get_current_user)):
    return products


@app.post("/api/products", status_code=201)
def create_product(payload: ProductIn, user: dict = Depends(require_admin)):
    global next_product_id
    if not any(c["id"] == payload.categoryId for c in categories):
        raise HTTPException(status_code=400, detail="Selected category does not exist")
    product = {
        "id": next_product_id,
        "name": payload.name.strip(),
        "price": payload.price,
        "categoryId": payload.categoryId,
    }
    next_product_id += 1
    products.append(product)
    return product


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: int, user: dict = Depends(require_admin)):
    global products
    if not any(p["id"] == product_id for p in products):
        raise HTTPException(status_code=404, detail="Product not found")
    products = [p for p in products if p["id"] != product_id]