'use client'

/* /privacidade — Política de Privacidade (texto em src/data/privacy.ts). Página avulsa, como a da pesquisa. */
import styled, { ThemeProvider } from 'styled-components'
import { ChevronLeft } from '@/components/ui'
import { Wordmark } from '@/components/ui/Logo'
import { PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_UPDATED_AT } from '@/data/privacy'
import { SHOP } from '@/data/shop'
import { GlobalStyle } from '@/styles/GlobalStyle'
import { theme } from '@/styles/theme'

export function PrivacyPage() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Top>
          <a href="/" aria-label={`${SHOP.name} — voltar para a loja`}>
            <Wordmark />
          </a>
        </Top>
        <Main id="conteudo">
          <Back href="/">
            <ChevronLeft /> Voltar para a loja
          </Back>
          <Card>
            <h1>Política de Privacidade</h1>
            <Updated>Última atualização: {PRIVACY_UPDATED_AT}</Updated>
            <Prose>
              <div>
                {PRIVACY_INTRO.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
              {PRIVACY_SECTIONS.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                  {section.items && (
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.note && <p>{section.note}</p>}
                </section>
              ))}
            </Prose>
          </Card>
        </Main>
      </Page>
    </ThemeProvider>
  )
}

const Page = styled.div`
  min-height: 100vh;
  background: var(--paper);
`

const Top = styled.header`
  display: flex;
  align-items: center;
  height: 68px;
  padding: 0 var(--gutter);
  border-bottom: 1px solid var(--line);
  background: var(--white);

  svg {
    height: 26px;
    width: auto;
    color: var(--ink);
  }
`

const Main = styled.main`
  max-width: 808px;
  margin: 0 auto;
  padding: 24px var(--gutter) 64px;
`

const Back = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);

  svg {
    width: 16px;
    height: 16px;
  }
`

const Card = styled.article`
  padding: clamp(22px, 4vw, 36px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);

  h1 {
    font-size: clamp(22px, 2.6vw, 26px);
    font-weight: 700;
    line-height: 1.2;
  }
`

const Updated = styled.p`
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-muted);
`

const Prose = styled.div`
  display: grid;
  gap: 28px;
  margin-top: 24px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-muted);

  h2 {
    margin-bottom: 8px;
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
  }

  p + p,
  p + ul,
  ul + p {
    margin-top: 10px;
  }

  ul {
    display: grid;
    gap: 6px;
    padding-left: 20px;
    list-style: disc;
  }
`
