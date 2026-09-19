import { useEffect, useMemo, useState } from 'react'
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

const BagIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
)

const InboxIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7h-13Z" />
  </svg>
)

const SearchIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
)

const LogoutIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)

const ChevronUpIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="m18 15-6-6-6 6" />
  </svg>
)

const ChevronDownIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const PlusIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const MinusIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M5 12h14" />
  </svg>
)

const TrashIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
)

const CloseIcon = ({ className = 'h-4 w-4 shrink-0' }) => (
  <svg {...iconProps} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

function MiniCart({ cart, onCheckout, setQuantity, removeFromCart }) {
  const [open, setOpen] = useState(true)
  const count = cart.items.reduce((n, i) => n + i.quantity, 0)
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[40] w-80 max-w-[calc(100vw-3rem)] animate-fade-up">
      <div className="pointer-events-auto overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_24px_60px_-28px_rgba(47,51,44,0.5)]">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Collapse cart' : 'Expand cart'}
          className="flex w-full items-center justify-between gap-3 bg-ink px-5 py-4 text-white transition hover:bg-black/80"
        >
          <span className="flex items-center gap-2.5">
            <BagIcon className="h-5 w-5" />
            <span className="font-sans text-sm font-bold uppercase tracking-wide">Cart</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 font-sans text-[11px] font-bold tabular-nums text-white">
                {count}
              </span>
            )}
          </span>
          <span className="flex items-center gap-3">
            {count > 0 && (
              <span className="font-serif text-sm font-semibold tabular-nums text-white/80">
                {formatPrice(cart.total)}
              </span>
            )}
            {open ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </span>
        </button>

        {open && (
          <div>
            {cart.items.length === 0 ? (
              <p className="px-5 py-6 text-center font-sans text-sm font-medium text-ink-soft">
                Your cart is empty. Add a few pieces.
              </p>
            ) : (
              <>
                <ul className="max-h-64 divide-y divide-line overflow-y-auto">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-sm font-semibold text-ink">{item.name}</p>
                        <p className="font-sans text-xs text-ink-soft">{formatPrice(item.price)} each</p>
                      </div>
                      <div className="flex items-center rounded-full border border-line bg-paper">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                          className="flex h-6 w-6 items-center justify-center text-ink-soft transition hover:text-ink"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-5 text-center font-sans text-xs font-bold tabular-nums text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                          className="flex h-6 w-6 items-center justify-center text-ink-soft transition hover:text-ink"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-ink-faint transition hover:text-rose-deep"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-line px-5 py-3">
                  <span className="font-sans text-xs font-bold uppercase tracking-wide text-ink-soft">Total</span>
                  <span className="font-serif text-lg font-semibold tabular-nums text-teal-700">
                    {formatPrice(cart.total)}
                  </span>
                </div>
                <div className="px-5 pb-4">
                  <button
                    onClick={onCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99]"
                  >
                    <BagIcon />
                    View full cart
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductTile({ product, index, onAdd }) {
  const tints = ['from-teal-100/80', 'from-teal-200/70', 'from-paper-2/80']
  return (
    <article
      className="group flex flex-col rounded-3xl border border-line bg-paper-2 p-4 shadow-[0_16px_40px_-28px_rgba(47,51,44,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-28px_rgba(47,51,44,0.55)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={`relative mb-5 flex aspect-[5/6] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${tints[index % 3]} via-paper-2 to-paper-2 ring-1 ring-inset ring-line/60`}
      >
        <span className="font-serif text-6xl font-light tracking-tight text-teal-300/70 transition group-hover:text-teal-600/60">
          {product.name.charAt(0)}
        </span>
        <BagIcon className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 text-teal-200" strokeWidth="1.4" />
        <button
          onClick={() => onAdd(product.id)}
          aria-label={`Add ${product.name} to cart`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white opacity-90 shadow-sm transition hover:bg-teal-700 active:scale-90"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="flex items-baseline justify-between gap-3 px-1.5">
        <h3 className="line-clamp-2 min-w-0 break-words font-serif text-lg font-semibold tracking-tight text-ink">
          {product.name}
        </h3>
        <p className="shrink-0 font-serif text-lg font-semibold tabular-nums text-teal-700">
          {formatPrice(product.price)}
        </p>
      </div>
      <button
        onClick={() => onAdd(product.id)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
      >
        <PlusIcon />
        Add to cart
      </button>
    </article>
  )
}

function SectionHeading({ title, count }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-line pb-3">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <span className="font-sans text-xs font-bold uppercase tracking-wide text-ink-soft">
        {count} {count === 1 ? 'piece' : 'pieces'}
      </span>
    </div>
  )
}

function CustomerPanel({ user, onLogout }) {
  const [data, setData] = useState({ categories: [], products: [] })
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  async function refresh() {
    try {
      const [categories, products, cart] = await Promise.all([
        api('/api/categories'),
        api('/api/products'),
        api('/api/cart'),
      ])
      setData({ categories, products })
      setCart(cart)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function addToCart(productId) {
    try {
      const next = await api('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      setCart(next)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function setQuantity(productId, quantity) {
    try {
      if (quantity <= 0) {
        await api(`/api/cart/items/${productId}`, { method: 'DELETE' })
      } else {
        const next = await api(`/api/cart/items/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        })
        setCart(next)
      }
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeFromCart(productId) {
    try {
      await api(`/api/cart/items/${productId}`, { method: 'DELETE' })
      setError('')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.products.filter((p) => {
      const inCategory =
        activeCategory === 'all' || p.categoryId === activeCategory
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      return inCategory && matchesQuery
    })
  }, [data.products, query, activeCategory])

  const visibleCategories = useMemo(
    () =>
      activeCategory === 'all'
        ? data.categories
        : data.categories.filter((c) => c.id === activeCategory),
    [data.categories, activeCategory],
  )

  const firstName = user.name.split(' ')[0]
  const productCount = data.products.length

  return (
    <div className="min-h-screen text-ink">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 pb-6 pt-10 animate-fade-up">
          <div className="flex items-center gap-6">
            <h1 className="font-serif text-3xl font-light uppercase tracking-[0.18em]">
              LUNA
            </h1>
            <span className="hidden rounded-full border border-teal-300 bg-paper-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft shadow-sm sm:inline-block">
              {data.categories.length} lines · {productCount} pieces
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-line bg-paper-2 py-1.5 pl-2 pr-4 shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-sans text-sm font-bold text-ink">{firstName}</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2.5 font-sans text-sm font-bold text-ink-soft transition hover:border-rose/40 hover:text-rose-deep"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </header>

        <main className="space-y-12 px-6 pb-20">
          {error && (
            <div className="rounded-2xl border border-rose/40 bg-rose-soft px-4 py-3 font-sans text-sm font-semibold text-rose-deep">
              {error}
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_24px_60px_-36px_rgba(47,51,44,0.45)]">
            <div className="relative overflow-hidden px-7 py-12 sm:px-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-100/70 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-teal-200/40 blur-2xl" />
              <p className="relative font-serif text-4xl font-light tracking-tight text-ink sm:text-5xl">
                The collection
              </p>
              <p className="relative mt-3 max-w-md font-sans text-sm font-medium leading-relaxed text-ink-soft">
                Softly organized pieces, ready for you, {firstName}. Search the
                collection or browse a line below.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`rounded-full px-4 py-2 font-sans text-sm font-bold transition ${
                  activeCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'border border-line bg-paper-2 text-ink-soft hover:text-ink'
                }`}
              >
                All
              </button>
              {data.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`rounded-full px-4 py-2 font-sans text-sm font-bold transition ${
                    activeCategory === c.id
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'border border-line bg-paper-2 text-ink-soft hover:text-ink'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1 sm:ml-auto sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the collection…"
                aria-label="Search products"
                className="w-full rounded-full border border-line bg-paper-2 py-2.5 pl-11 pr-5 font-sans text-sm text-ink placeholder:text-ink-soft shadow-sm outline-none transition focus:border-teal-600 focus:ring-[3px] focus:ring-teal-600/15"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-line bg-paper-2 p-12 text-center font-sans text-sm font-medium text-ink-soft shadow-[0_16px_40px_-24px_rgba(47,51,44,0.3)]">
              Opening the collection…
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-teal-300 bg-paper-2/70 px-8 py-16 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                <InboxIcon className="h-6 w-6" />
              </span>
              <p className="font-serif text-lg font-semibold text-ink">
                Nothing here yet
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                This line is still being styled. Check back soon.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-teal-300 bg-paper-2/70 px-8 py-14 text-center">
              <p className="font-serif text-lg font-semibold text-ink">
                Nothing matches {query ? `“${query}”` : 'your filters'}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Try a different word or switch back to All.
              </p>
            </div>
          ) : (
            visibleCategories
              .map((category) => ({
                ...category,
                items: filteredProducts.filter(
                  (p) => p.categoryId === category.id,
                ),
              }))
              .filter((category) => category.items.length > 0)
              .map((category) => (
                <section key={category.id}>
                  <SectionHeading title={category.name} count={category.items.length} />
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {category.items.map((p, i) => (
                      <ProductTile key={p.id} product={p} index={i} onAdd={addToCart} />
                    ))}
                  </div>
                </section>
              ))
          )}
        </main>

        <footer className="border-t border-line px-6 py-8">
          <p className="flex items-center gap-2 font-serif text-sm tracking-wide text-ink-faint">
            <BagIcon className="h-4 w-4" />
            LUNA — soft clothing for every day.
          </p>
        </footer>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper-2 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink">
                Your cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-rose-soft hover:text-rose-deep"
              >
                <CloseIcon />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                  <BagIcon className="h-6 w-6" />
                </span>
                <p className="font-serif text-lg font-semibold text-ink">
                  Your cart is empty
                </p>
                <p className="text-sm text-ink-soft">
                  Add a few pieces from the collection.
                </p>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {cart.items.map((item) => (
                    <li key={item.id} className="flex flex-col gap-3 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-serif text-base font-semibold text-ink">
                            {item.name}
                          </p>
                          <p className="mt-0.5 font-sans text-sm text-ink-soft">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <p className="font-serif text-base font-semibold tabular-nums text-teal-700">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-ink-faint transition hover:text-rose-deep"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-line bg-paper">
                          <button
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                          >
                            <MinusIcon />
                          </button>
                          <span className="min-w-8 text-center font-sans text-sm font-bold tabular-nums text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-sans text-sm font-bold uppercase tracking-wide text-ink-soft">
                      Total
                    </span>
                    <span className="font-serif text-2xl font-semibold tabular-nums text-teal-700">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99]">
                    <BagIcon />
                    Checkout
                  </button>
                  <p className="mt-3 text-center font-sans text-xs font-medium text-ink-soft">
                    Checkout is a demo — no real orders yet.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
      <MiniCart
        cart={cart}
        onCheckout={() => setCartOpen(true)}
        setQuantity={setQuantity}
        removeFromCart={removeFromCart}
      />
    </div>
  )
}

export default CustomerPanel