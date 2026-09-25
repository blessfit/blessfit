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
- [Motion](https://motion.dev) para animações (entrada, parallax, texto que acende com o scroll)
- [Lenis](https://lenis.darkroom.engineering) para scroll suave
- Fontes self-hosted: Montserrat (mesma família do logotipo) e Allison (caligrafia)

## Onde editar

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, textos, produtos, FAQ | `src/data/site.js` |
| Fotos | `src/assets/img/` |
| Cores, fontes e espaçamentos | `src/styles/global.css` (variáveis em `:root`) |
| Logo vetorizado (blessfit e b.f) | `src/components/logoPaths.js` |
| Imagem de compartilhamento | `public/og.jpg` |

Cada seção da página é um componente em `src/components/` com o seu próprio CSS.

## Antes de publicar

- [ ] Trocar o número de WhatsApp em `SITE.whatsapp` (DDI + DDD + número, só dígitos)
- [ ] Confirmar o @ do Instagram em `SITE.instagram`
- [ ] Revisar as respostas do FAQ (trocas e entrega) com a política real da marca
- [ ] Substituir as fotos pelas fotos oficiais em alta resolução
- [ ] Em `index.html`, trocar `/og.jpg` pela URL absoluta do domínio
