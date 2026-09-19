products = [
    {"id": 1, "name": "Wool Sweater", "category": "Knitwear", "price": 4500},
    {"id": 2, "name": "Linen Shirt", "category": "Tops", "price": 3200},
    {"id": 3, "name": "Denim Jeans", "category": "Bottoms", "price": 3800},
    {"id": 4, "name": "Cotton Tote", "category": "Accessories", "price": 1500},
    {"id": 5, "name": "Merino Scarf", "category": "Accessories", "price": 2200},
    {"id": 6, "name": "Silk Blouse", "category": "Tops", "price": 5400},
]

wishlist = []


def show_products():
    print("\n--- PRODUCT LIST ---")
    for p in products:
        print(f"{p['id']:>2}. {p['name']:<16} {p['category']:<12} Rs. {p['price']}")


def show_wishlist():
    print("\n--- WISHLIST ---")
    if not wishlist:
        print("Wishlist is empty.")
        return
    for i, product_id in enumerate(wishlist, start=1):
        p = next(item for item in products if item["id"] == product_id)
        print(f"{i}. {p['name']:<16} {p['category']:<12} Rs. {p['price']}")


def add_to_wishlist(product_id):
    if not any(p["id"] == product_id for p in products):
        print("Invalid product id.")
        return
    if product_id in wishlist:
        print("Already in wishlist.")
        return
    wishlist.append(product_id)
    print("Added to wishlist.")


def remove_from_wishlist(product_id):
    if product_id in wishlist:
        wishlist.remove(product_id)
        print("Removed from wishlist.")
    else:
        print("Product not in wishlist.")


def main():
    while True:
        print("\n1. Show products")
        print("2. Add to wishlist")
        print("3. Remove from wishlist")
        print("4. Show wishlist")
        print("5. Exit")
        choice = input("Choose an option: ").strip()

        if choice == "1":
            show_products()
        elif choice == "2":
            show_products()
            product_id = int(input("Enter product id to add: "))
            add_to_wishlist(product_id)
        elif choice == "3":
            show_wishlist()
            product_id = int(input("Enter product id to remove: "))
            remove_from_wishlist(product_id)
        elif choice == "4":
            show_wishlist()
        elif choice == "5":
            print("Goodbye.")
            break
        else:
            print("Invalid option.")


if __name__ == "__main__":
    main()