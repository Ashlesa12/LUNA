import { useEffect, useState } from 'react'
import { api, formatPrice, getToken, setToken } from './api.js'
import AuthPage from './AuthPage.jsx'
import AdminPanel from './AdminPanel.jsx'
import CustomerPanel from './CustomerPanel.jsx'

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink">
      <div className="animate-fade-up text-center">
        <h1 className="font-serif text-4xl font-light uppercase tracking-[0.15em]">
          LUNA
        </h1>
        <p className="mt-2 font-sans text-sm font-medium text-ink-soft">
          Opening the collection…
        </p>
      </div>
    </div>
  )
}

function decodePaymentData() {
  const encodedPayment = new URLSearchParams(window.location.search).get('data')
  if (!encodedPayment) return null

  try {
    const normalizedPayment = encodedPayment.replace(/\s/g, '+')
    const paddedPayment = normalizedPayment.padEnd(
      Math.ceil(normalizedPayment.length / 4) * 4,
      '=',
    )
    return JSON.parse(atob(paddedPayment))
  } catch {
    return null
  }
}

function getPaymentRoute() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/payment/success') return 'success'
  if (path === '/payment/failure') return 'failure'
  return null
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
      <path d="m6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  )
}

function PaymentResultPage({ outcome, paymentData, onSignIn }) {
  const paymentStatus = String(paymentData?.status || '').toUpperCase()
  const isVerifiedSuccess = outcome === 'success' && paymentStatus === 'COMPLETE'
  const isFailure = outcome === 'failure'
  const amount = Number(paymentData?.total_amount)
  const hasAmount = Number.isFinite(amount) && amount > 0
  const transactionId =
    paymentData?.transaction_code || paymentData?.transaction_uuid || 'Not provided'

  const title = isVerifiedSuccess
    ? 'Payment complete'
    : isFailure
      ? 'Payment not completed'
      : 'Payment response unavailable'
  const description = isVerifiedSuccess
    ? 'Sign in and we will confirm your order straight away.'
    : isFailure
      ? 'No payment was completed, so your order is still unpaid.'
      : 'We could not read the eSewa response, so your order was not changed.'

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-ink">
      <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-line bg-paper-2 shadow-[0_24px_60px_-36px_rgba(47,51,44,0.45)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-teal-200/50 blur-3xl" />

        <div className="relative p-7 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="font-serif text-2xl font-light uppercase tracking-[0.18em]">
              LUNA
            </span>
            <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              eSewa checkout
            </span>
          </div>

          <div
            className={`mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-2xl ${
              isVerifiedSuccess
                ? 'bg-teal-100 text-teal-700'
                : isFailure
                  ? 'bg-rose-soft text-rose-deep'
                  : 'bg-paper text-ink-soft'
            }`}
          >
            {isVerifiedSuccess ? <CheckIcon /> : isFailure ? <CloseIcon /> : <InfoIcon />}
          </div>

          <div className="mt-6 text-center">
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-sm font-sans text-sm font-medium leading-relaxed text-ink-soft">
              {description}
            </p>
          </div>

          {paymentData && (
            <dl className="mt-8 divide-y divide-line border-y border-line font-sans text-sm">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="font-semibold text-ink-soft">Payment status</dt>
                <dd className="font-bold text-ink">{paymentData.status || '—'}</dd>
              </div>
              {hasAmount && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="font-semibold text-ink-soft">Amount</dt>
                  <dd className="font-bold tabular-nums text-ink">
                    {formatPrice(amount)}
                  </dd>
                </div>
              )}
              {transactionId !== 'Not provided' && (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="font-semibold text-ink-soft">Transaction ID</dt>
                  <dd className="max-w-[60%] break-all text-right font-bold text-ink">
                    {transactionId}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <p className="mt-6 rounded-2xl bg-teal-100/70 px-4 py-3 text-center font-sans text-sm font-semibold text-teal-700">
            You are signed out, so this order has not been updated yet.
          </p>

          <button
            type="button"
            onClick={onSignIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 font-sans text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99]"
          >
            Sign in to finish
          </button>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const paymentRoute = getPaymentRoute()
  const paymentData = decodePaymentData()
  const paymentStatus = String(paymentData?.status || '').toUpperCase()
  const paymentOutcome = paymentStatus
    ? paymentStatus === 'COMPLETE'
      ? 'success'
      : 'failure'
    : paymentRoute

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setBooting(false)
      return
    }
    api('/api/auth/me')
      .then((me) => setUser(me))
      .catch(() => setToken(null))
      .finally(() => setBooting(false))
  }, [])

  function logout() {
    setToken(null)
    setUser(null)
  }

  if (booting) return <Splash />

  if (!user) {
    return paymentOutcome && !showAuth ? (
      <PaymentResultPage
        outcome={paymentOutcome}
        paymentData={paymentData}
        onSignIn={() => setShowAuth(true)}
      />
    ) : (
      <AuthPage onAuthed={setUser} />
    )
  }

  if (user.role === 'admin') return <AdminPanel user={user} onLogout={logout} />

  return <CustomerPanel user={user} onLogout={logout} />
}

export default App
