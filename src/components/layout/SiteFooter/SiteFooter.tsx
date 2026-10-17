import { Container, CreditCard, Instagram, Repeat, Truck, WhatsApp, Wordmark, type IconComponent } from '@/components/ui'
import { INFO_PAGES, PAYMENT_METHODS } from '@/data/content'
import { NAV, SHOP } from '@/data/shop'
import { external, instagramUrl, whatsappUrl } from '@/lib/links'
import { useStore } from '@/store/storeContext'
import * as S from './SiteFooter.styles'

const PERKS: { icon: IconComponent; title: string; text: string }[] = [
  { icon: Truck, title: 'Frete grátis', text: `Acima de R$ ${SHOP.freeShippingFrom}` },
  { icon: CreditCard, title: `${SHOP.installments}x sem juros`, text: 'No cartão de crédito' },
  { icon: WhatsApp, title: 'Compra pelo WhatsApp', text: 'Atendimento humano' },
  { icon: Repeat, title: 'Troca fácil', text: 'Primeira troca grátis' },
]

export function SiteFooter() {
  const { openInfo } = useStore()
  const year = new Date().getFullYear()

  return (
    <S.Root id="atendimento">
      <S.Perks>
        <Container>
          <ul>
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon />
                <span>
                  <strong>{title}</strong>
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </S.Perks>

      <Container>
        <S.Cols>
          <S.Brand>
            <Wordmark title="Blessfit" />
            <p>Moda fitness com conforto, performance e estilo — do treino ao dia a dia.</p>
            <S.Social>
              <a href={instagramUrl} {...external} aria-label={`Instagram @${SHOP.instagram}`}>
                <Instagram />
              </a>
              <a href={whatsappUrl()} {...external} aria-label="WhatsApp da Blessfit">
                <WhatsApp />
              </a>
            </S.Social>
          </S.Brand>

          <S.Col>
            <h3>Atendimento</h3>
            <ul>
              <li>
                <a href={whatsappUrl()} {...external}>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={instagramUrl} {...external}>
                  Instagram @{SHOP.instagram}
                </a>
              </li>
              <li>
                <a href={whatsappUrl('Olá! Quero acompanhar meu pedido na Blessfit.')} {...external}>
                  Acompanhar pedido
                </a>
              </li>
            </ul>
          </S.Col>

          <S.Col>
            <h3>Ajuda</h3>
            <ul>
              {INFO_PAGES.map((page) => (
                <li key={page.id}>
                  <button type="button" onClick={() => openInfo(page.id)}>
                    {page.title}
                  </button>
                </li>
              ))}
              <li>
                <a href="/privacidade">Política de Privacidade</a>
              </li>
            </ul>
          </S.Col>

          <S.Col as="nav" aria-label="Rodapé">
            <h3>Loja</h3>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </S.Col>
        </S.Cols>

        <S.Payments>
          <h3>Formas de pagamento</h3>
          <ul>
            {PAYMENT_METHODS.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </S.Payments>

        <S.Bottom>
          <span>
            © {year} {SHOP.name}. Todos os direitos reservados.
          </span>
          <span>
            {SHOP.tagline}
          </span>
        </S.Bottom>
      </Container>
    </S.Root>
  )
}
