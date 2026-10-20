import Link from 'next/link'
import { Button, Dialog, IconButton, Instagram, Minus, Picture, Plus, SizePicker, Spinner, User, WhatsApp } from '@/components/ui'
import type { Size } from '@/data/catalog'
import { CATEGORIES } from '@/data/content'
import { NAV, SHOP } from '@/data/shop'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import { checkoutUrl } from '@/lib/orders'
import { formatBRL } from '@/lib/price'
import { ONLINE_CHECKOUT } from '@/lib/site'
import { firstName, useMe } from '@/hooks/useMe'
import { useSignOut } from '@/hooks/useSignOut'
import { useStore, type BagItem } from '@/store/storeContext'
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
      <MenuAccount />
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

/** Conta no menu do celular (no header ela só aparece do tablet para cima). */
function MenuAccount() {
  const me = useMe()
  const { closePanel } = useStore()
  const [signingOut, signOut] = useSignOut()
  if (me === undefined) return null
  if (!me) {
    return (
      <Button variant="outline" block glyph={User} href="/entrar" onClick={closePanel}>
        Entrar ou criar conta
      </Button>
    )
  }
  const first = firstName(me)
  return (
    <S.MenuUser>
      <S.MenuHello>
        <S.MenuAvatar aria-hidden="true">
          {me.avatar ? <img src={me.avatar} alt="" referrerPolicy="no-referrer" /> : first.charAt(0).toUpperCase()}
        </S.MenuAvatar>
        <S.MenuGreeting>
          Olá, <strong>{first}</strong>
        </S.MenuGreeting>
        <S.SignOut type="button" onClick={signOut} disabled={signingOut} aria-busy={signingOut}>
          {signingOut ? (
            <>
              <Spinner /> Saindo…
            </>
          ) : (
            'Sair'
          )}
        </S.SignOut>
      </S.MenuHello>
      <S.MenuUserLinks>
        <Link href="/conta/pedidos" onClick={closePanel}>
          Meus pedidos
        </Link>
        <Link href="/conta/dados" onClick={closePanel}>
          Meus dados
        </Link>
      </S.MenuUserLinks>
    </S.MenuUser>
  )
}

/** Peça na sacola: os tamanhos ficam sempre à mostra para escolher ou trocar. */
function BagRow({ line }: { line: BagItem }) {
  const { setQty, setSize, setSelected, removeFromBag } = useStore()

  return (
    <S.Line $muted={!line.selected || line.qty === 0}>
      <S.Check>
        <input
          type="checkbox"
          checked={line.selected}
          onChange={(e) => setSelected(line, e.target.checked)}
          aria-label={`Selecionar ${line.product.name} (${line.variant.color.name}${line.size ? `, tam. ${line.size}` : ''})`}
        />
      </S.Check>
      <S.Thumb>
        <Picture image={line.variant.images.main} decorative sizes="88px" />
      </S.Thumb>
      <div>
        <S.LineName>{line.product.name}</S.LineName>
        <S.LineMeta>{line.variant.color.name}</S.LineMeta>
        <S.PickSize>
          <SizePicker
            label={line.size ? 'Tamanho' : 'Escolha o tamanho'}
            sizes={line.product.sizes}
            soldOut={line.variant.soldOut ?? line.product.soldOut}
            value={line.size}
            onChange={(size: Size) => setSize(line, size)}
            compact
          />
        </S.PickSize>
        <S.Qty data-keep={line.qty === 0 || undefined}>
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
          <IconButton $size={36} type="button" aria-label="Aumentar quantidade" onClick={() => setQty(line, line.qty + 1)}>
            <Plus />
          </IconButton>
        </S.Qty>
      </div>
      <S.LineEnd>
        <strong>{formatBRL(line.product.price * line.qty)}</strong>
        <S.TextButton type="button" aria-label={`Remover ${line.product.name} da sacola`} onClick={() => removeFromBag(line)}>
          Remover
        </S.TextButton>
      </S.LineEnd>
    </S.Line>
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
    needSize,
    selectAll,
  } = useStore()
  // produto com frete grátis (painel → Preços) já garante o frete grátis do pedido
  const freeProduct = checkoutLines.some((l) => l.product.freeShipping)
  const missing = freeProduct ? 0 : Math.max(0, SHOP.freeShippingFrom - bagTotal)
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
            <i style={{ width: `${missing === 0 ? 100 : Math.min(100, (bagTotal / SHOP.freeShippingFrom) * 100)}%` }} />
          </span>
        </S.Shipping>
        <S.Total>
          <span>
            Subtotal ({checkoutCount} {checkoutCount === 1 ? 'peça' : 'peças'})
          </span>
          <strong>{formatBRL(bagTotal)}</strong>
        </S.Total>
        <S.Pix>ou {formatBRL(bagPixTotal)} no Pix</S.Pix>
        {needSize.length > 0 && (
          <S.NeedSize role="status">
            Escolha o tamanho de {needSize.length === 1 ? '1 peça' : `${needSize.length} peças`} para incluir no pedido.
          </S.NeedSize>
        )}
        {checkoutLines.length > 0 && !ONLINE_CHECKOUT ? (
          <Button variant="primary" block glyph={WhatsApp} href={checkoutUrl(checkoutLines)} {...external}>
            Finalizar pelo WhatsApp
          </Button>
        ) : checkoutLines.length > 0 ? (
          <>
            <Button variant="primary" block href="/carrinho">
              Finalizar compra
            </Button>
            <S.Alt>
              ou{' '}
              <a href={checkoutUrl(checkoutLines)} {...external}>
                finalize pelo WhatsApp
              </a>
            </S.Alt>
          </>
        ) : (
          <Button as="button" variant="primary" block disabled>
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
            <BagRow key={`${line.product.id}-${line.variant.color.name}-${line.size}`} line={line} />
          ))}
        </S.Lines>
      )}
    </Dialog>
  )
}
