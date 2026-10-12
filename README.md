# blessfit

Loja da **Blessfit** — moda fitness com conforto, performance e estilo.
Venda simples pelo WhatsApp: o botão “Comprar” e a sacola abrem a conversa já com produto, cor, tamanho e valor.

Produção: https://blessfit.vercel.app (deploy automático a cada push na `main`).

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # checa os tipos e gera a versão de produção em dist/
npm run preview    # serve o build localmente
npm run lint
npm run typecheck  # só a checagem de tipos (tsc)
```

## Stack

- React 19 + Vite + TypeScript (strict)
- [styled-components](https://styled-components.com) para os estilos (tema + componentes estilizados)
- Fonte self-hosted: Montserrat (mesma família do logotipo)

## Onde editar

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, frete grátis, parcelas, Pix, cupom, menu e slides do banner | `src/data/shop.ts` |
| Produtos (conjuntos e peças avulsas), cores, preços e tamanhos | `src/data/products.ts` |
| Todas as fotos (produtos por cor, banner, categorias) | `src/data/images.ts` + `src/assets/img/` |
| Categorias, benefícios, “Sobre”, avaliações, FAQ, políticas e guia de tamanhos | `src/data/content.ts` |
| Cores, fontes e espaçamentos | `src/styles/theme.ts` |
| Logo vetorizado (blessfit e b.f) | `src/components/ui/Logo/logoPaths.ts` |

### Coleções

| Linha | Conjuntos | Peças avulsas |
| --- | --- | --- |
| Feminino | Maré, Aurora, Brisa | Top Maré, Shorts Maré, Regata Brisa, Legging Brisa |
| Masculino | Impulso, Fôlego | Camiseta Impulso, Shorts Impulso, Regata Fôlego |

Cada cor de produto tem as próprias fotos: ao trocar a cor no site, as imagens trocam junto.
Para adicionar fotos novas, salve-as como `nome-900.webp` e `nome-1600.webp` numa pasta em
`src/assets/img/` e cadastre-as em `src/data/images.ts`.

## Estrutura

```
src/
├── app/                  # raiz da aplicação (App + providers)
├── pages/Store/          # composição das seções da loja
├── sections/             # banner, lançamentos, categorias, conjuntos, peças avulsas, sobre, avaliações, FAQ
├── components/
│   ├── layout/           # faixa de benefícios, header com busca, gavetas (menu, sacola, favoritos), rodapé
│   ├── product/          # card de produto, card de conjunto, janela “visualizar”
│   └── ui/               # Button, Carousel, Dialog, Swatches, SizePicker, PriceTag, Icons, Logo...
├── store/                # estado da loja: sacola e favoritos (salvos no navegador)
├── lib/                  # links do WhatsApp, pedidos e formatação de preço
├── data/                 # conteúdo editável (loja, produtos, imagens, textos)
├── styles/               # theme, GlobalStyle, media queries, mixins
└── assets/               # imagens
```

## Antes de divulgar

- [x] Número de WhatsApp em `SHOP.whatsapp`: (37) 99959-9655
- [x] Instagram em `SHOP.instagram`: @blessfit_ep
- [ ] Revisar preços, avaliações, FAQ, política de troca, entrega e guia de tamanhos com os dados reais
- [ ] Em `index.html`, trocar `/og.jpg` pela URL absoluta do domínio
