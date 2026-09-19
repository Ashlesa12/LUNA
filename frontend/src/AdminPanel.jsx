import { useEffect, useState } from 'react'
import { api, formatPrice } from './api.js'

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0',
}

const BagIcon = () => (
  <svg {...iconProps}>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
)

const PlusIcon = () => (
  <svg {...iconProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const TrashIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)

const TagIcon = () => (
  <svg {...iconProps}>
    <path d="M3 12l9-9 9 9-9 9-9-9Z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
)

const BoxIcon = () => (
  <svg {...iconProps}>
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
)

const InboxIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7h-13Z" />
  </svg>
)

const UsersIcon = () => (
  <svg {...iconProps}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </svg>
)

const LogoutIcon = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)

const CloseIcon = () => (
  <svg {...iconProps}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const inputClasses =
  'w-full rounded-2xl border border-line bg-paper-2 px-4 py-2.5 pl-11 font-sans text-sm text-ink placeholder:text-ink-soft outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15'

const plainInputClasses =
  'w-full rounded-2xl border border-line bg-paper-2 px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-soft outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15'

const labelClasses =
  'mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft'

function AdminPanel({ user, onLogout }) {
  const [data, setData] = useState({ categories: [], products: [] })
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const [categories, products, customers] = await Promise.all([
        api('/api/categories'),
        api('/api/products'),
        api('/api/admin/customers'),
      ])
      setData({ categories, products })
      setCustomers(customers)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function addCategory(e) {
    e.preventDefault()
    const name = categoryName.trim()
    if (!name) {
      setError('Category name cannot be empty')
      return
    }
    try {
      const created = await api('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      setCategoryName('')
      setProductCategory(String(created.id))
      setError('')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function addProduct(e) {
    e.preventDefault()
    const name = productName.trim()
    if (!name) {
      setError('Product name cannot be empty')
      return
    }
    if (!productCategory) {
      setError('Please select a category')
      return
    }
    try {
      await api('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(productPrice) || 0,
          categoryId: Number(productCategory),
        }),
      })
      setProductName('')
      setProductPrice('')
      setError('')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeCategory(id) {
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' })
      setError('')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeProduct(id) {
    try {
      await api(`/api/products/${id}`, { method: 'DELETE' })
      setError('')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const productCount = data.products.length

  return (
    <div className="min-h-screen text-ink">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 px-6 pb-8 pt-12 animate-fade-up">
          <div>
            <h1 className="font-serif text-4xl font-light uppercase tracking-[0.15em] text-ink md:text-5xl">
              LUNA
            </h1>
            <p className="mt-1 font-sans text-sm font-medium text-ink-soft">
              Admin atelier · manage categories, products, and customers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-teal-300 bg-paper-2 py-1.5 pl-2 pr-4 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-sans text-sm font-bold text-ink">
                {user.name}
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                Admin
              </span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 font-sans text-sm font-bold text-ink-soft transition hover:border-rose/40 hover:text-rose-deep"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </header>

        <main className="space-y-10 px-6 pb-16">
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose/40 bg-rose-soft px-4 py-3 ring-1 ring-rose/10 animate-fade-up">
              <p className="font-sans text-sm font-semibold text-rose-deep">
                {error}
              </p>
              <button
                onClick={() => setError('')}
                aria-label="Dismiss error"
                className="text-rose/70 transition hover:text-rose-deep"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-soft">
            <span className="rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 shadow-sm">
              {data.categories.length}{' '}
              {data.categories.length === 1 ? 'category' : 'categories'}
            </span>
            <span className="rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 shadow-sm">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
            <span className="rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 shadow-sm">
              {customers.length}{' '}
              {customers.length === 1 ? 'account' : 'accounts'}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-line bg-paper-2 p-10 text-center font-sans text-sm font-medium text-ink-soft shadow-[0_16px_40px_-24px_rgba(47,51,44,0.3)]">
              Loading atelier…
            </div>
          ) : (
            <>
              <section className="grid gap-6 md:grid-cols-2">
                <form
                  onSubmit={addCategory}
                  className="rounded-3xl border border-line bg-paper-2 p-7 shadow-[0_16px_40px_-24px_rgba(47,51,44,0.35)]"
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <TagIcon />
                    </span>
                    <h2 className="font-serif text-xl font-semibold tracking-tight">
                      Add Category
                    </h2>
                  </div>
                  <label className={labelClasses} htmlFor="add-category">
                    Category name
                  </label>
                  <div className="relative mb-5">
                    <TagIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input
                      id="add-category"
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g. Women, Men, Shoes"
                      className={inputClasses}
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 active:scale-[0.98]"
                  >
                    <PlusIcon />
                    Create Category
                  </button>
                </form>

                <form
                  onSubmit={addProduct}
                  className="rounded-3xl border border-line bg-paper-2 p-7 shadow-[0_16px_40px_-24px_rgba(47,51,44,0.35)]"
                >
                  <div className="mb-5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <BoxIcon />
                    </span>
                    <h2 className="font-serif text-xl font-semibold tracking-tight">
                      Add Product
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses} htmlFor="add-product-category">
                        Category
                      </label>
                      <div className="relative">
                        <BoxIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <select
                          id="add-product-category"
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className={`${inputClasses} appearance-none`}
                        >
                          <option value="">
                            {data.categories.length === 0
                              ? 'No categories yet — create one first'
                              : 'Choose a category'}
                          </option>
                          {data.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses} htmlFor="add-product-name">
                        Product name
                      </label>
                      <div className="relative">
                        <BagIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input
                          id="add-product-name"
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g. Linen Shirt, Denim Jacket"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses} htmlFor="add-product-price">
                        Price (optional)
                      </label>
                      <input
                        id="add-product-price"
                        type="number"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="e.g. 1599"
                        className={plainInputClasses}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-600 px-5 py-2.5 font-sans text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 active:scale-[0.98]"
                  >
                    <PlusIcon />
                    Add Product
                  </button>
                </form>
              </section>

              <section>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold tracking-tight">
                    Categories
                  </h2>
                  <span className="text-sm font-medium text-ink-soft">
                    Items grouped under their category
                  </span>
                </div>

                {data.categories.length === 0 ? (
                  <div className="flex flex-col items-center rounded-3xl border border-dashed border-teal-300 bg-paper-2/70 px-8 py-16 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                      <InboxIcon className="h-6 w-6" />
                    </span>
                    <p className="font-serif text-lg font-semibold text-ink">
                      No categories yet
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Create your first category — like Women, Men, or Shoes —
                      to start stocking the brand.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {data.categories.map((category) => {
                      const items = data.products.filter(
                        (p) => p.categoryId === category.id,
                      )
                      return (
                        <div
                          key={category.id}
                          className="rounded-3xl border border-line bg-paper-2 p-7 shadow-[0_16px_40px_-24px_rgba(47,51,44,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_rgba(47,51,44,0.4)]"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="font-serif text-xl font-semibold tracking-tight">
                              {category.name}
                            </h3>
                            <button
                              onClick={() => removeCategory(category.id)}
                              aria-label={`Delete ${category.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-rose-soft hover:text-rose-deep"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-ink-faint">
                            {items.length} product{items.length === 1 ? '' : 's'}
                          </p>
                          {items.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-teal-300 px-4 py-4 text-sm font-medium text-ink-soft">
                              <InboxIcon />
                              No products in this category yet.
                            </div>
                          ) : (
                            <ul className="divide-y divide-line">
                              {items.map((p) => (
                                <li
                                  key={p.id}
                                  className="flex items-center justify-between gap-3 rounded-xl px-1.5 py-2.5 transition hover:bg-teal-100/60"
                                >
                                  <span className="min-w-0 flex-1 truncate font-serif text-base text-ink">
                                    {p.name}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <span className="font-serif text-base font-semibold tabular-nums text-teal-700">
                                      {formatPrice(p.price)}
                                    </span>
                                    <button
                                      onClick={() => removeProduct(p.id)}
                                      aria-label={`Remove ${p.name}`}
                                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition hover:bg-rose-soft hover:text-rose-deep"
                                    >
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    </button>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold tracking-tight">
                    Customers
                  </h2>
                  <span className="text-sm font-medium text-ink-soft">
                    Everyone with an account
                  </span>
                </div>

                {customers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-teal-300 bg-paper-2/70 px-8 py-12 text-center">
                    <p className="font-serif text-lg font-semibold text-ink">
                      No customers yet
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      New accounts will appear here as people register.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_16px_40px_-24px_rgba(47,51,44,0.35)]">
                    <ul className="divide-y divide-line">
                      {customers.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-3 px-6 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-serif text-base font-bold text-teal-700">
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-sans text-sm font-bold text-ink">
                                {c.name}
                              </p>
                              <p className="truncate font-sans text-sm text-ink-soft">
                                {c.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              c.role === 'admin'
                                ? 'bg-teal-600 text-white'
                                : 'bg-teal-100 text-teal-700'
                            }`}
                          >
                            {c.role}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel