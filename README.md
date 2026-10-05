# blessfit

Landing page da **blessfit** — moda fitness com propósito.
_Faith · Strength · Purpose — 1 Co 6:19-20._

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run preview  # serve o build localmente
npm run lint
```

## Stack

- React 19 + Vite
- [styled-components](https://styled-components.com) para os estilos (tema + componentes estilizados)
- [Motion](https://motion.dev) para animações (entrada, parallax, texto que acende com o scroll)
- [Lenis](https://lenis.darkroom.engineering) para scroll suave
- Fontes self-hosted: Montserrat (mesma família do logotipo) e Allison (caligrafia)

## Onde editar

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, textos, produtos, FAQ | `src/data/site.js` |
| Fotos | `src/assets/img/` |
| Cores, fontes e espaçamentos | `src/styles/theme.js` |
| Breakpoints (media queries) | `src/styles/theme.js` → `src/styles/media.js` |
| Logo vetorizado (blessfit e b.f) | `src/components/ui/Logo/logoPaths.js` |
| Imagem de compartilhamento | `public/og.jpg` |

## Estrutura

```
src/
├── app/                  # raiz da aplicação
│   ├── App.jsx           # layout global (loader, navbar, footer) + página
│   └── providers/        # ThemeProvider, GlobalStyle, MotionConfig
├── pages/
│   └── Home/             # composição das seções da landing page
├── sections/             # seções da página (Hero, Collection, Faq...)
│   └── Hero/
│       ├── Hero.jsx          # componente
│       ├── Hero.styles.js    # styled-components da seção
│       └── index.js          # export público
├── components/
│   ├── layout/           # Navbar, Footer, Loader, WhatsAppFab, SkipLink
│   └── ui/               # design system: Button, Section, Container,
│                         # Typography, TextLink, Reveal, Icons, Logo...
├── hooks/                # useIntro, useSmoothScroll, useMediaQuery
├── lib/                  # utilitários (scroll, links, curvas de animação)
├── data/site.js          # conteúdo editável
├── styles/               # theme, GlobalStyle, media queries, mixins
└── assets/               # imagens
```

- Imports usam o alias `@/` → `src/` (configurado em `vite.config.js` e `jsconfig.json`).
- Os tokens do `theme.js` são publicados como variáveis CSS (`var(--ink)`, `var(--mint)`...) pelo `GlobalStyle`,
  então os estilos usam `var(--token)`. Seções claras (`<Section $tone="cream">`) trocam `--accent` e `--muted`.
- Props só de estilo usam o prefixo `$` (transient props), ex.: `$active`, `$open`, `$pinned`.

## Antes de publicar

- [ ] Trocar o número de WhatsApp em `SITE.whatsapp` (DDI + DDD + número, só dígitos)
- [ ] Confirmar o @ do Instagram em `SITE.instagram`
- [ ] Revisar as respostas do FAQ (trocas e entrega) com a política real da marca
- [ ] Substituir as fotos pelas fotos oficiais em alta resolução
- [ ] Em `index.html`, trocar `/og.jpg` pela URL absoluta do domínio
