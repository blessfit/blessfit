'use client'

/*
 * "Continuar com o Google" em popup (Google Identity Services): o cliente não sai do site.
 * Sem NEXT_PUBLIC_GOOGLE_CLIENT_ID, ou se o script do Google não carregar, fica o botão que redireciona.
 */
import { useEffect, useRef, useState } from 'react'
import { signInWithGoogle, signInWithGoogleToken } from '@/app/conta/actions'
import * as S from './Account.styles'
import { GoogleLogo } from './fields'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

type GoogleId = {
  initialize: (config: Record<string, unknown>) => void
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

let script: Promise<void> | null = null
function loadScript(): Promise<void> {
  script ??= new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = 'https://accounts.google.com/gsi/client'
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => {
      script = null
      reject(new Error('gsi'))
    }
    document.head.appendChild(el)
  })
  return script
}

/** Nonce: o Google recebe o hash (vai dentro do token) e o Supabase recebe o original para conferir. */
async function makeNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return { raw, hashed }
}

export function GoogleForm({ next }: { next: string }) {
  const slot = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    let alive = true
    Promise.all([loadScript(), makeNonce()])
      .then(([, nonce]) => {
        const google = window.google?.accounts.id
        if (!alive || !google || !slot.current) return
        google.initialize({
          client_id: CLIENT_ID,
          nonce: nonce.hashed,
          ux_mode: 'popup',
          use_fedcm_for_button: true,
          callback: async ({ credential }: { credential: string }) => {
            setPending(true)
            setError('')
            const result = await signInWithGoogleToken(credential, nonce.raw, next)
            if (result.next) {
              window.location.assign(result.next)
              return
            }
            setPending(false)
            setError(result.error ?? 'Não foi possível entrar com o Google.')
          },
        })
        google.renderButton(slot.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'center',
          locale: 'pt-BR',
          width: Math.min(400, slot.current.parentElement?.clientWidth ?? 400),
        })
        setReady(true)
      })
      .catch(() => setReady(false))
    return () => {
      alive = false
    }
  }, [next])

  return (
    <div>
      <S.Divider>ou continue com</S.Divider>
      {/* o botão do Google entra aqui; até carregar (ou sem configuração), vale o botão que redireciona */}
      <S.GoogleSlot ref={slot} hidden={!ready || pending} />
      {pending && <S.Lead style={{ textAlign: 'center' }}>Entrando…</S.Lead>}
      {!ready && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <S.GoogleButton type="submit">
            <GoogleLogo /> Continuar com o Google
          </S.GoogleButton>
        </form>
      )}
      {error && (
        <S.Notice $tone="error" role="alert">
          {error}
        </S.Notice>
      )}
    </div>
  )
}
