import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Close } from '../Icons'
import * as S from './Dialog.styles'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  /** `modal` centralizado; `right`/`left` são gavetas laterais. */
  variant?: S.DialogVariant
  /** Rodapé fixo (ex.: total e botão de finalizar). */
  footer?: ReactNode
  /** Largura máxima do modal. */
  width?: number
  children: ReactNode
}

/** Atualiza a trava de rolagem da página conforme há janelas abertas. */
function syncScrollLock() {
  document.documentElement.classList.toggle('is-locked', document.querySelector('dialog[open]') !== null)
}

/**
 * Janela acessível baseada no <dialog> nativo: prende o foco, fecha com Esc
 * ou clicando fora e trava a rolagem da página enquanto está aberta.
 */
export function Dialog({ open, onClose, title, variant = 'modal', footer, width, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const isOpen = dialog.hasAttribute('open')
    // navegadores sem <dialog> nativo (iOS < 15.4): abre só pelo atributo `open`
    const native = typeof dialog.showModal === 'function'
    if (open && !isOpen) {
      if (native) dialog.showModal()
      else dialog.setAttribute('open', '')
    }
    if (!open && isOpen) {
      if (native) dialog.close()
      else dialog.removeAttribute('open')
    }
    syncScrollLock()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    return () => {
      if (dialog?.hasAttribute('open')) {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }
      syncScrollLock()
    }
  }, [])

  return (
    <S.Root
      ref={ref}
      $variant={variant}
      $width={width}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // clique no fundo escuro (fora da caixa) fecha
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <S.Box>
          <S.Head>
            <S.Title id={titleId}>{title}</S.Title>
            <S.CloseButton type="button" aria-label="Fechar" onClick={onClose}>
              <Close />
            </S.CloseButton>
          </S.Head>
          <S.Body>{children}</S.Body>
          {footer && <S.Foot>{footer}</S.Foot>}
        </S.Box>
      )}
    </S.Root>
  )
}
