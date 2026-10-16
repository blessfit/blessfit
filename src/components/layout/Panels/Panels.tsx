import { Button, Dialog, IconButton, Instagram, Minus, Picture, Plus, WhatsApp } from '@/components/ui'
import { CATEGORIES } from '@/data/content'
import { NAV, SHOP } from '@/data/shop'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import { checkoutUrl } from '@/lib/orders'
import { formatBRL } from '@/lib/price'
import { useStore } from '@/store/storeContext'
import * as S from './Panels.styles'

/** Gavetas laterais da loja: menu (celular) e sacola. */
export function Panels() {
  const { panel, closePanel } = useStore()
  return (
    <>
      <Dialog open={panel === 'menu'} onClose={closePanel} title="Menu" variant="left">
        <MobileMenu />
      </Dialog>
      <BagPanel open={panel === 'bag'} onClose={closePanel} />
    </>
  )
}

function MobileMenu() {
  const { closePanel } = useStore()
  return (
    <S.Menu>
      <nav aria-label="Menu principal">
        <S.MenuLinks>
          {NAV.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={closePanel}>
                {item.label}
              </a>
            </li>
          ))}
        </S.MenuLinks>
      </nav>

      <S.MenuGroup>
        <h3>Compre por categoria</h3>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.label}>
              <a
                href={c.whatsapp ? whatsappUrl(c.whatsapp) : c.href}
                {...(c.whatsapp ? external : {})}
                onClick={closePanel}
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </S.MenuGroup>

      <S.MenuFoot>
        <Button variant="primary" block glyph={WhatsApp} href={whatsappUrl()} {...external}>
          Atendimento no WhatsApp
        </Button>
        <Button variant="outline" block glyph={Instagram} href={instagramUrl} {...external}>
          @{SHOP.instagram}
        </Button>
        <p>
          {SHOP.tagline}
        </p>
      </S.MenuFoot>
    </S.Menu>
  )
}

function BagPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    bag,
    bagTotal,
    bagPixTotal,
    bagCount,
    checkoutLines,
    checkoutCount,
    setQty,
    setSelected,
    selectAll,
    removeFromBag,
  } = useStore()
  const missing = Math.max(0, SHOP.freeShippingFrom - bagTotal)
  const allSelected = bag.every((l) => l.selected)

  const footer =
    bag.length > 0 ? (
      <S.Summary>
        <S.Shipping>
          <p>
            {missing > 0 ? (
              <>
                Faltam <strong>{formatBRL(missing)}</strong> para o frete grátis
              </>
            ) : (
              <strong>Você ganhou frete grátis!</strong>
            )}
          </p>
          <span>
            <i style={{ width: `${Math.min(100, (bagTotal / SHOP.freeShippingFrom) * 100)}%` }} />
          </span>
        </S.Shipping>
        <S.Total>
          <span>
            Subtotal ({checkoutCount} {checkoutCount === 1 ? 'peça' : 'peças'})
          </span>
          <strong>{formatBRL(bagTotal)}</strong>
        </S.Total>
        <S.Pix>ou {formatBRL(bagPixTotal)} no Pix</S.Pix>
        {checkoutLines.length > 0 ? (
          <Button variant="primary" block glyph={WhatsApp} href={checkoutUrl(checkoutLines)} {...external}>
            Finalizar pelo WhatsApp
          </Button>
        ) : (
          <Button as="button" variant="primary" block glyph={WhatsApp} disabled>
            Selecione itens para finalizar
          </Button>
        )}
        <Button as="button" variant="outline" size="sm" block onClick={onClose}>
          Continuar comprando
        </Button>
      </S.Summary>
    ) : undefined

  return (
    <Dialog open={open} onClose={onClose} title={`Sacola (${bagCount})`} variant="right" footer={footer}>
      {bag.length === 0 ? (
        <S.Empty>
          <p>Sua sacola está vazia.</p>
          <Button variant="primary" href="#conjuntos" onClick={onClose}>
            Ver conjuntos
          </Button>
        </S.Empty>
      ) : (
        <S.Lines>
          <S.SelectAll>
            <input type="checkbox" checked={allSelected} onChange={(e) => selectAll(e.target.checked)} />
            Selecionar todos
          </S.SelectAll>
          {bag.map((line) => (
            <S.Line
              key={`${line.product.id}-${line.variant.color.name}-${line.size}`}
              $muted={!line.selected || line.qty === 0}
            >
              <S.Check>
                <input
                  type="checkbox"
                  checked={line.selected}
                  onChange={(e) => setSelected(line, e.target.checked)}
                  aria-label={`Selecionar ${line.product.name} (${line.variant.color.name}, tam. ${line.size})`}
                />
              </S.Check>
              <S.Thumb>
                <Picture image={line.variant.images.main} decorative sizes="88px" />
              </S.Thumb>
              <div>
                <S.LineName>{line.product.name}</S.LineName>
                <S.LineMeta>
                  {line.variant.color.name} · Tam. {line.size}
                </S.LineMeta>
                <S.Qty>
                  <IconButton
                    $size={36}
                    type="button"
                    aria-label="Diminuir quantidade"
                    disabled={line.qty === 0}
                    onClick={() => setQty(line, line.qty - 1)}
                  >
                    <Minus />
                  </IconButton>
                  <span aria-live="polite">{line.qty}</span>
                  <IconButton
                    $size={36}
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQty(line, line.qty + 1)}
                  >
                    <Plus />
                  </IconButton>
                </S.Qty>
              </div>
              <S.LineEnd>
                <strong>{formatBRL(line.product.price * line.qty)}</strong>
                <S.TextButton
                  type="button"
                  aria-label={`Remover ${line.product.name} da sacola`}
                  onClick={() => removeFromBag(line)}
                >
                  Remover
                </S.TextButton>
              </S.LineEnd>
            </S.Line>
          ))}
        </S.Lines>
      )}
    </Dialog>
  )
}
