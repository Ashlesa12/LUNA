# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A store owner managing their catalog on a laptop/desktop browser. The app is built as a course lab assignment; the primary acting user is the operator who stocks shelves (categories) and adds items (products).

## Product Purpose

Lets the owner keep an e-commerce store's catalog tidy: create product categories, add products to them with a price, and browse every item grouped under its category. Success means the owner can stock and prune the catalog quickly and see the whole store at a glance.

## Positioning

A small, category-first catalog organizer: the grouping is the product. Any owner with a list gets an immediately legible partition of store items with no other machinery (no orders, carts, or customers).

## Operating Context

Desktop browser (normal office light). Two processes run together during use: the React+Vite frontend (`frontend/`) proxying `/api` to the FastAPI backend (`backend/`, port 8000). Data lives in the backend's in-memory arrays, so it resets on server restart. Seeded with Electronics and Books.

## Capabilities and Constraints

- Create a category; duplicates and empty names rejected.
- Delete a category, which also removes its products.
- Add a product (name, optional price) to an existing category.
- Remove a single product.
- Items are displayed grouped under their category with counts.
- Backend: FastAPI in-memory store (no database — optional per assignment).
- Frontend: React + Tailwind CSS with the sage & cream rustic visual world currently built.
- State changes persist only while the backend process is alive.

## Brand Commitments

No binding name, voice, or identity constraint. The sage & cream rustic visual world was built and pinned earlier; the user is now explicitly exploring alternative visual directions, so it is current but no longer a binding constraint.

## Evidence on Hand

- Seed catalog: Electronics and Books categories with three products, in `backend/main.py`.
- Working API: `/api/categories` and `/api/products` (GET/POST/DELETE).
- No real customers, orders, testimonials, or pricing data; nothing beyond the seed must be fabricated as real.

## Product Principles

1. Operator first: the owner trusts it with a glance, and herdles of controls stay obvious.
2. Category grouping is the core idea; every layout must make the grouping legible, never bury it.
3. Layout is openly revisable while capabilities and behavior stay intact.
4. Desktop-first: designed for a comfortable laptop/browser reading distance.

## Accessibility & Inclusion

No product-specific accessibility requirement was established; standard desktop web operating practices apply.