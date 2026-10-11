import { Button, Close, Dialog, IconButton, Instagram, Minus, Picture, Plus, WhatsApp } from '@/components/ui'
import { CATEGORIES } from '@/data/content'
import { NAV, SHOP } from '@/data/shop'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import { checkoutUrl } from '@/lib/orders'
import { formatBRL, pixPrice } from '@/lib/price'
import { useStore } from '@/store/storeContext'
import * as S from './Panels.styles'

/** Gavetas laterais da loja: menu (celular), sacola e favoritos. */
export function Panels() {
  const { panel, closePanel } = useStore()
  return (
    <>
      <Dialog open={panel === 'menu'} onClose={closePanel} title="Menu" variant="left">
        <MobileMenu />
      </Dialog>
      <BagPanel open={panel === 'bag'} onClose={closePanel} />
      <Dialog open={panel === 'favorites'} onClose={closePanel} title="Favoritos" variant="right">
        <Favorites />
      </Dialog>
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
          {SHOP.tagline} · {SHOP.verseRef}
        </p>
      </S.MenuFoot>
    </S.Menu>
  )
}

function BagPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bag, bagTotal, bagCount, setQty } = useStore()
  const missing = Math.max(0, SHOP.freeShippingFrom - bagTotal)

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
          <span>Subtotal</span>
          <strong>{formatBRL(bagTotal)}</strong>
        </S.Total>
        <S.Pix>ou {formatBRL(pixPrice(bagTotal))} no Pix</S.Pix>
        <Button variant="primary" block glyph={WhatsApp} href={checkoutUrl(bag)} {...external}>
          Finalizar pelo WhatsApp
        </Button>
      </S.Summary>
    ) : undefined

  return (
    <Dialog open={open} onClose={onClose} title={`Sacola (${bagCount})`} variant="right" footer={footer}>
      {bag.length === 0 ? (
        <S.Empty>
          <p>Sua sacola está vazia.</p>
          <Button variant="primary" href="#lancamentos" onClick={onClose}>
            Ver lançamentos
          </Button>
        </S.Empty>
      ) : (
        <S.Lines>
          {bag.map((line) => (
            <S.Line key={`${line.product.id}-${line.variant.color.name}-${line.size}`}>
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
                <IconButton
                  $size={36}
                  type="button"
                  aria-label={`Remover ${line.product.name} da sacola`}
                  onClick={() => setQty(line, 0)}
                >
                  <Close />
                </IconButton>
                <strong>{formatBRL(line.product.price * line.qty)}</strong>
              </S.LineEnd>
            </S.Line>
          ))}
        </S.Lines>
      )}
    </Dialog>
  )
}

function Favorites() {
  const { favorites, toggleFavorite, openQuickView, closePanel } = useStore()

  if (favorites.length === 0) {
    return (
      <S.Empty>
        <p>Toque no coração dos produtos para salvar seus favoritos.</p>
        <Button variant="primary" href="#lancamentos" onClick={closePanel}>
          Ver lançamentos
        </Button>
      </S.Empty>
    )
  }

  return (
    <S.Lines>
      {favorites.map((product) => (
        <S.Line key={product.id}>
          <S.Thumb>
            <Picture image={product.variants[0].images.main} decorative sizes="88px" />
          </S.Thumb>
          <div>
            <S.LineName>{product.name}</S.LineName>
            <S.LineMeta>{formatBRL(product.price)}</S.LineMeta>
            <S.TextButton
              type="button"
              onClick={() => {
                closePanel()
                openQuickView(product)
              }}
            >
              Ver e comprar
            </S.TextButton>
          </div>
          <S.LineEnd>
            <IconButton
              $size={36}
              type="button"
              aria-label={`Remover ${product.name} dos favoritos`}
              onClick={() => toggleFavorite(product)}
            >
              <Close />
            </IconButton>
          </S.LineEnd>
        </S.Line>
      ))}
    </S.Lines>
  )
}
