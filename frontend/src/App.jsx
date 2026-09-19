import { useEffect, useState } from 'react'

const inputClasses =
  'w-full rounded-2xl border border-line bg-paper-2 px-4 py-2.5 pl-11 font-sans text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15'

const labelClasses =
  'mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft'

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

const TrashIcon = () => (
  <svg {...iconProps}>
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

const InboxIcon = () => (
  <svg {...iconProps}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7h-13Z" />
  </svg>
)

const CloseIcon = () => (
  <svg {...iconProps}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const CONTRACT_COMMENT = `<!--
THESIS: LUNA is a clothing brand with a soft, airy catalog: categories and products are quietly organized into rounded white cards on warm paper, and managing the collection feels calm rather than administrative — it refuses the heavy ruled register and the dashboard shell alike.
OWN-WORLD: Soft airy marketplace - warm paper ground with a faint teal wash above, white rounded cards, hairline borders, restrained lunar-teal accents, elegant Petrona serif for names and prices, clean Nunito Sans for controls.
STORY: The visitor lands on a light, breathable page, opens one soft card to add a category and another to add a product, and sees each category as a tidy white card listing its items.
FIRST VIEWPORT: A soft teal-washed top with the serif store title and pill count chips; two white rounded cards side by side for entry; a two-column grid of white category cards below with teal price accents.
FORM: Refinement of the incumbent Operate catalog surface toward an airy, serif-led mood chosen by the user; seed key: SOFT-AERY-SERIF.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`

async function api(path, options) {
  const res = await fetch(path, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }
  if (res.status === 204) return null
  return res.json()
}

function formatPrice(price) {
  return price > 0 ? `Rs. ${price.toLocaleString('en-IN')}` : '—'
}

function App() {
  const [data, setData] = useState({ categories: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    try {
      const [categories, products] = await Promise.all([
        api('/api/categories'),
        api('/api/products'),
      ])
      setData({ categories, products })
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
      <div dangerouslySetInnerHTML={{ __html: CONTRACT_COMMENT }} />
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 px-6 pb-8 pt-12 animate-fade-up">
          <div>
            <h1 className="font-serif text-4xl font-light uppercase tracking-[0.15em] text-ink md:text-5xl">
              LUNA
            </h1>
           
            <p className="mt-1 text-sm font-medium text-ink-faint">
              A clothing brand · create categories, add products, and browse
              the catalog.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
            <span className="rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 shadow-sm">
              {data.categories.length}{' '}
              {data.categories.length === 1 ? 'category' : 'categories'}
            </span>
            <span className="rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 shadow-sm">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
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

          {loading ? (
            <div className="rounded-3xl border border-line bg-paper-2 p-10 text-center font-sans text-sm font-medium text-ink-soft shadow-[0_16px_40px_-24px_rgba(47,51,44,0.3)]">
              Loading catalog…
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
                  <label className={labelClasses}>Category name</label>
                  <div className="relative mb-5">
                    <TagIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input
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
                      <label className={labelClasses}>Category</label>
                      <div className="relative">
                        <BoxIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <select
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className={inputClasses}
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
                      <label className={labelClasses}>Product name</label>
                      <div className="relative">
                        <BagIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g. Linen Shirt, Denim Jacket"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Price (optional)</label>
                      <input
                        type="number"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="e.g. 1599"
                        className="w-full rounded-2xl border border-line bg-paper-2 px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15"
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
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App