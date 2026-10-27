export type TurnstileClient = {
  render: (container: HTMLElement, options: {
    sitekey: string
    action: string
    size: 'flexible'
    theme: 'auto'
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
  }) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

let loading: Promise<TurnstileClient> | undefined

export function loadTurnstile() {
  const browser = window as Window & { turnstile?: TurnstileClient }
  if (browser.turnstile) return Promise.resolve(browser.turnstile)
  if (loading) return loading
  loading = new Promise<TurnstileClient>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    const timeout = window.setTimeout(() => fail(), 15_000)
    function fail() {
      window.clearTimeout(timeout)
      script.remove()
      loading = undefined
      reject(new Error('Verification could not load'))
    }
    script.onerror = fail
    script.onload = () => {
      window.clearTimeout(timeout)
      if (browser.turnstile) resolve(browser.turnstile)
      else fail()
    }
    document.head.appendChild(script)
  })
  return loading
}
