/*
 * TODAS as imagens da loja ficam aqui.
 *
 * Para trocar pelas fotos oficiais da Blessfit:
 *   1. coloque o arquivo em src/assets/img/ (de preferência .webp, ~1200px no lado maior);
 *   2. importe no topo deste arquivo (ex.: `import conjuntoAurora from '@/assets/img/conjunto-aurora.webp'`);
 *   3. troque a entrada desejada por `local(conjuntoAurora, 'texto alternativo')`
 *      (ou `sized(foto900, foto1600, 'texto')` se tiver a foto em dois tamanhos, como as do Graça e do Força).
 *
 * Cada COR de produto tem o seu conjunto de fotos em IMAGES.products (ex.: 'conjunto-forca-preto'
 * e 'conjunto-forca-marinho'); em src/data/products.ts cada cor aponta para a sua chave.
 *
 * As fotos `stock(...)` são do Unsplash (licença livre) e servem só como placeholder nesta primeira versão.
 */
import backBlack from '@/assets/img/back-black.webp'
import backMen from '@/assets/img/back-men.webp'
import fabricTeal from '@/assets/img/fabric-teal.webp'
import legsBlack from '@/assets/img/legs-black.webp'
import modelBlack from '@/assets/img/model-black.webp'
import modelMen from '@/assets/img/model-men.webp'
import modelTeal from '@/assets/img/model-teal.webp'
import shortsMen from '@/assets/img/shorts-men.webp'
import teeMen from '@/assets/img/tee-men.webp'
import topTeal from '@/assets/img/top-teal.webp'
// Conjunto Graça (azul petróleo) — fotos geradas no Google Flow a partir das peças reais
import gracaCostas900 from '@/assets/img/graca/costas-900.webp'
import gracaCostas1600 from '@/assets/img/graca/costas-1600.webp'
import gracaFrente900 from '@/assets/img/graca/frente-900.webp'
import gracaFrente1600 from '@/assets/img/graca/frente-1600.webp'
import gracaShortsCostas900 from '@/assets/img/graca/shorts-costas-900.webp'
import gracaShortsCostas1600 from '@/assets/img/graca/shorts-costas-1600.webp'
import gracaShortsFrente900 from '@/assets/img/graca/shorts-frente-900.webp'
import gracaShortsFrente1600 from '@/assets/img/graca/shorts-frente-1600.webp'
import gracaTopCostas900 from '@/assets/img/graca/top-costas-900.webp'
import gracaTopCostas1600 from '@/assets/img/graca/top-costas-1600.webp'
import gracaTopFrente900 from '@/assets/img/graca/top-frente-900.webp'
import gracaTopFrente1600 from '@/assets/img/graca/top-frente-1600.webp'
// Conjunto Força (preto e azul marinho) — fotos geradas no Google Flow a partir das peças reais
import forcaCamisetaMarinho900 from '@/assets/img/forca/camiseta-marinho-900.webp'
import forcaCamisetaMarinho1600 from '@/assets/img/forca/camiseta-marinho-1600.webp'
import forcaCamisetaPreto900 from '@/assets/img/forca/camiseta-preto-900.webp'
import forcaCamisetaPreto1600 from '@/assets/img/forca/camiseta-preto-1600.webp'
import forcaMarinhoFrente900 from '@/assets/img/forca/conjunto-marinho-frente-900.webp'
import forcaMarinhoFrente1600 from '@/assets/img/forca/conjunto-marinho-frente-1600.webp'
import forcaPretoCostas900 from '@/assets/img/forca/conjunto-preto-costas-900.webp'
import forcaPretoCostas1600 from '@/assets/img/forca/conjunto-preto-costas-1600.webp'
import forcaPretoFrente900 from '@/assets/img/forca/conjunto-preto-frente-900.webp'
import forcaPretoFrente1600 from '@/assets/img/forca/conjunto-preto-frente-1600.webp'
import forcaShortsMarinhoCostas900 from '@/assets/img/forca/shorts-marinho-costas-900.webp'
import forcaShortsMarinhoCostas1600 from '@/assets/img/forca/shorts-marinho-costas-1600.webp'
import forcaShortsMarinhoFrente900 from '@/assets/img/forca/shorts-marinho-frente-900.webp'
import forcaShortsMarinhoFrente1600 from '@/assets/img/forca/shorts-marinho-frente-1600.webp'
import forcaShortsPretoCostas900 from '@/assets/img/forca/shorts-preto-costas-900.webp'
import forcaShortsPretoCostas1600 from '@/assets/img/forca/shorts-preto-costas-1600.webp'
import forcaShortsPretoFrente900 from '@/assets/img/forca/shorts-preto-frente-900.webp'
import forcaShortsPretoFrente1600 from '@/assets/img/forca/shorts-preto-frente-1600.webp'

export type Img = {
  src: string
  /** Versões em larguras diferentes (o navegador escolhe a ideal). */
  srcSet?: string
  alt: string
  /** Ponto focal da foto quando ela é recortada (CSS object-position). */
  position?: string
}

/** Fotos de um produto numa cor: principal, a que aparece ao passar o mouse e (opcional) mais fotos para a galeria. */
export type ProductImages = { main: Img; hover: Img; gallery?: Img[] }

const WIDTHS = [480, 800, 1200, 1800]

/** Foto do Unsplash, com tamanhos otimizados gerados pela própria CDN. */
function stock(id: string, alt: string, position?: string): Img {
  const url = (w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=72&w=${w}`
  return { src: url(800), srcSet: WIDTHS.map((w) => `${url(w)} ${w}w`).join(', '), alt, position }
}

/** Foto da própria loja (src/assets/img). */
function local(src: string, alt: string, position?: string): Img {
  return { src, alt, position }
}

/** Foto da própria loja em dois tamanhos (arquivos -900.webp e -1600.webp). */
function sized(small: string, large: string, alt: string, position?: string): Img {
  return { src: small, srcSet: `${small} 900w, ${large} 1600w`, alt, position }
}

/**
 * Fotos de uma pasta de src/assets/img salvas em várias larguras (nome-900.webp, nome-1600.webp, ...).
 * Todas as larguras encontradas entram no srcset; a menor vira o `src` padrão.
 */
function folder(files: Record<string, string>, dir: string) {
  return (name: string, alt: string, position?: string): Img => {
    const prefix = `../assets/img/${dir}/${name}-`
    const sizes = Object.entries(files)
      .filter(([path]) => path.startsWith(prefix) && /^\d+\.webp$/.test(path.slice(prefix.length)))
      .map(([path, url]) => ({ width: Number.parseInt(path.slice(prefix.length), 10), url }))
      .sort((a, b) => a.width - b.width)
    if (!sizes.length) throw new Error(`Foto não encontrada: src/assets/img/${dir}/${name}-<largura>.webp`)
    return { src: sizes[0].url, srcSet: sizes.map((s) => `${s.url} ${s.width}w`).join(', '), alt, position }
  }
}

// Banner principal — fotos de campanha geradas no Google Flow (16:9)
const banner = folder(
  import.meta.glob<string>('../assets/img/banner/*.webp', { eager: true, import: 'default' }),
  'banner',
)

// Conjunto Templo (regata + legging) — fotos geradas no Google Flow a partir das peças reais
const templo = folder(
  import.meta.glob<string>('../assets/img/templo/*.webp', { eager: true, import: 'default' }),
  'templo',
)

const TEMPLO = {
  conjuntoPretoFrente: templo('conjunto-preto-frente', 'Modelo de frente com o Conjunto Templo preto: regata 1 Co 6:19-20 e legging', '50% 30%'),
  conjuntoPretoCostas: templo('conjunto-preto-costas', 'Modelo de costas com o Conjunto Templo preto e o logo blessfit no cós', '50% 30%'),
  conjuntoMarinhoFrente: templo('conjunto-marinho-frente', 'Modelo de frente com o Conjunto Templo azul marinho: regata 1 Co 6:19-20 e legging', '50% 30%'),
  conjuntoMarinhoCostas: templo('conjunto-marinho-costas', 'Modelo de costas com o Conjunto Templo azul marinho e o logo blessfit no cós', '50% 30%'),
  conjuntoBrancoFrente: templo('conjunto-branco-frente', 'Modelo de frente com a regata branca 1 Co 6:19-20 e legging preta', '50% 30%'),
  conjuntoBrancoCostas: templo('conjunto-branco-costas', 'Modelo de costas com a regata branca e legging preta com o logo blessfit', '50% 30%'),
  regataPretoFrente: templo('regata-preto-frente', 'Regata preta com estampa blessfit 1 Co 6:19-20, de frente', '50% 25%'),
  regataPretoCostas: templo('regata-preto-costas', 'Costas da regata preta com cava aberta', '50% 25%'),
  regataMarinhoFrente: templo('regata-marinho-frente', 'Regata azul marinho com estampa blessfit 1 Co 6:19-20, de frente', '50% 25%'),
  regataMarinhoCostas: templo('regata-marinho-costas', 'Costas da regata azul marinho com o logo blessfit na barra', '50% 25%'),
  regataBrancoFrente: templo('regata-branco-frente', 'Regata branca com estampa blessfit 1 Co 6:19-20, de frente', '50% 25%'),
  regataBrancoCostas: templo('regata-branco-costas', 'Costas da regata branca com barra arredondada', '50% 25%'),
  leggingPretoFrente: templo('legging-preto-frente', 'Legging preta de cós alto com logo b.f, de frente', '50% 55%'),
  leggingPretoCostas: templo('legging-preto-costas', 'Legging preta de costas com o logo blessfit no cós', '50% 55%'),
  leggingMarinhoFrente: templo('legging-marinho-frente', 'Legging azul marinho de cós alto com logo b.f, de frente', '50% 55%'),
  leggingMarinhoCostas: templo('legging-marinho-costas', 'Legging azul marinho de costas com o logo blessfit no cós', '50% 55%'),
}

// Regata masculina Propósito (preto e azul marinho) — fotos geradas no Google Flow a partir das peças reais
const proposito = folder(
  import.meta.glob<string>('../assets/img/proposito/*.webp', { eager: true, import: 'default' }),
  'proposito',
)

const PROPOSITO = {
  regataPretoFrente: proposito('regata-preto-frente', 'Regata masculina preta com o logo b.f no peito', '50% 20%'),
  regataPretoCostas: proposito('regata-preto-costas', 'Costas da regata masculina preta com o logo blessfit', '50% 20%'),
  regataMarinhoFrente: proposito('regata-marinho-frente', 'Regata masculina azul marinho com o logo b.f no peito', '50% 20%'),
  regataMarinhoCostas: proposito('regata-marinho-costas', 'Costas da regata masculina azul marinho com o logo blessfit', '50% 20%'),
  conjuntoPretoCostas: proposito('conjunto-preto-costas', 'Modelo de costas com regata e shorts pretos Blessfit', '50% 30%'),
  conjuntoMarinhoCostas: proposito('conjunto-marinho-costas', 'Modelo de costas com regata e shorts azul marinho Blessfit', '50% 30%'),
}

const GRACA = {
  frente: sized(gracaFrente900, gracaFrente1600, 'Modelo de frente com o Conjunto Graça azul petróleo: top de alças finas e shorts de cós alto', '50% 30%'),
  costas: sized(gracaCostas900, gracaCostas1600, 'Modelo de costas com o Conjunto Graça, mostrando as alças cruzadas e o logo blessfit', '50% 30%'),
  topFrente: sized(gracaTopFrente900, gracaTopFrente1600, 'Top azul petróleo de frente, com o logo b.f'),
  topCostas: sized(gracaTopCostas900, gracaTopCostas1600, 'Costas do top com alças cruzadas em Y e o logo blessfit'),
  shortsFrente: sized(gracaShortsFrente900, gracaShortsFrente1600, 'Shorts azul petróleo de cós alto, de frente, com o logo b.f', '50% 25%'),
  shortsCostas: sized(gracaShortsCostas900, gracaShortsCostas1600, 'Shorts azul petróleo de costas, com o logo blessfit no cós', '50% 25%'),
}

const FORCA = {
  pretoFrente: sized(forcaPretoFrente900, forcaPretoFrente1600, 'Modelo de frente com o Conjunto Força preto: camiseta raglan e shorts com cordão', '50% 30%'),
  pretoCostas: sized(forcaPretoCostas900, forcaPretoCostas1600, 'Modelo de costas com o Conjunto Força preto e o logo blessfit na camiseta', '50% 30%'),
  marinhoFrente: sized(forcaMarinhoFrente900, forcaMarinhoFrente1600, 'Modelo de frente com o Conjunto Força azul marinho: camiseta raglan e shorts com cordão', '50% 30%'),
  camisetaPreto: sized(forcaCamisetaPreto900, forcaCamisetaPreto1600, 'Camiseta raglan preta com o logo b.f no peito'),
  camisetaMarinho: sized(forcaCamisetaMarinho900, forcaCamisetaMarinho1600, 'Camiseta raglan azul marinho com o logo b.f no peito'),
  shortsPretoFrente: sized(forcaShortsPretoFrente900, forcaShortsPretoFrente1600, 'Shorts masculino preto com cordão e logo b.f, de frente', '50% 25%'),
  shortsPretoCostas: sized(forcaShortsPretoCostas900, forcaShortsPretoCostas1600, 'Shorts masculino preto de costas', '50% 25%'),
  shortsMarinhoFrente: sized(forcaShortsMarinhoFrente900, forcaShortsMarinhoFrente1600, 'Shorts masculino azul marinho com cordão e logo b.f, de frente', '50% 25%'),
  shortsMarinhoCostas: sized(forcaShortsMarinhoCostas900, forcaShortsMarinhoCostas1600, 'Shorts masculino azul marinho de costas', '50% 25%'),
}

export const IMAGES = {
  /**
   * Slides do banner principal (carrossel), na mesma ordem de HERO_SLIDES (src/data/shop.ts).
   * Fotos horizontais 16:9 em src/assets/img/banner (nome-900/1600/2400.webp).
   */
  heroSlides: [
    banner('colecao', 'Casal caminhando à beira-mar com os conjuntos Graça azul petróleo e Força preto', '65% 50%'),
    banner('masculino', 'Homem sentado em escadaria de pedra com o Conjunto Força azul marinho', '30% 50%'),
    banner('feminino', 'Mulher se alongando em um deck de frente para o mar com o Conjunto Graça azul petróleo', '68% 50%'),
    banner('pecas', 'Amigos descansando em um terraço ensolarado com top Graça e camiseta Força', '35% 50%'),
  ],

  /** Uma entrada por produto + cor. */
  products: {
    // ——— Conjuntos femininos ———
    'conjunto-graca-petroleo': {
      main: GRACA.frente,
      hover: GRACA.costas,
      gallery: [GRACA.topFrente, GRACA.topCostas, GRACA.shortsFrente, GRACA.shortsCostas],
    },
    'conjunto-aurora-coral': {
      main: stock('photo-1628971021877-37187fde57f4', 'Modelo com top grafite e shorts coral em fundo claro', '50% 30%'),
      hover: stock('photo-1628970937415-72e1677309c6', 'Duas modelos com conjuntos fitness coloridos', '50% 40%'),
    },
    'conjunto-templo-preto': {
      main: TEMPLO.conjuntoPretoFrente,
      hover: TEMPLO.conjuntoPretoCostas,
      gallery: [TEMPLO.regataPretoFrente, TEMPLO.regataPretoCostas, TEMPLO.leggingPretoFrente, TEMPLO.leggingPretoCostas],
    },
    'conjunto-templo-marinho': {
      main: TEMPLO.conjuntoMarinhoFrente,
      hover: TEMPLO.conjuntoMarinhoCostas,
      gallery: [
        TEMPLO.regataMarinhoFrente,
        TEMPLO.regataMarinhoCostas,
        TEMPLO.leggingMarinhoFrente,
        TEMPLO.leggingMarinhoCostas,
      ],
    },
    'conjunto-templo-branco': {
      main: TEMPLO.conjuntoBrancoFrente,
      hover: TEMPLO.conjuntoBrancoCostas,
      gallery: [TEMPLO.regataBrancoFrente, TEMPLO.regataBrancoCostas, TEMPLO.leggingPretoFrente, TEMPLO.leggingPretoCostas],
    },

    // ——— Conjuntos masculinos ———
    'conjunto-forca-preto': {
      main: FORCA.pretoFrente,
      hover: FORCA.pretoCostas,
      gallery: [FORCA.camisetaPreto, FORCA.shortsPretoFrente, FORCA.shortsPretoCostas],
    },
    'conjunto-forca-marinho': {
      main: FORCA.marinhoFrente,
      hover: FORCA.camisetaMarinho,
      gallery: [FORCA.shortsMarinhoFrente, FORCA.shortsMarinhoCostas],
    },
    // Propósito = regata nova + o mesmo Shorts Força
    'conjunto-proposito-preto': {
      main: PROPOSITO.regataPretoFrente,
      hover: PROPOSITO.conjuntoPretoCostas,
      gallery: [PROPOSITO.regataPretoCostas, FORCA.shortsPretoFrente, FORCA.shortsPretoCostas],
    },
    'conjunto-proposito-marinho': {
      main: PROPOSITO.regataMarinhoFrente,
      hover: PROPOSITO.conjuntoMarinhoCostas,
      gallery: [PROPOSITO.regataMarinhoCostas, FORCA.shortsMarinhoFrente, FORCA.shortsMarinhoCostas],
    },

    // ——— Peças avulsas ———
    'regata-proposito-preto': {
      main: PROPOSITO.regataPretoFrente,
      hover: PROPOSITO.regataPretoCostas,
      gallery: [PROPOSITO.conjuntoPretoCostas],
    },
    'regata-proposito-marinho': {
      main: PROPOSITO.regataMarinhoFrente,
      hover: PROPOSITO.regataMarinhoCostas,
      gallery: [PROPOSITO.conjuntoMarinhoCostas],
    },
    'top-graca-petroleo': { main: GRACA.topFrente, hover: GRACA.topCostas, gallery: [GRACA.frente, GRACA.costas] },
    'shorts-graca-petroleo': { main: GRACA.shortsFrente, hover: GRACA.shortsCostas, gallery: [GRACA.frente] },
    'camiseta-forca-preto': { main: FORCA.camisetaPreto, hover: FORCA.pretoCostas, gallery: [FORCA.pretoFrente] },
    'camiseta-forca-marinho': { main: FORCA.camisetaMarinho, hover: FORCA.marinhoFrente },
    'shorts-forca-preto': { main: FORCA.shortsPretoFrente, hover: FORCA.shortsPretoCostas, gallery: [FORCA.pretoFrente] },
    'regata-templo-preto': { main: TEMPLO.regataPretoFrente, hover: TEMPLO.regataPretoCostas, gallery: [TEMPLO.conjuntoPretoFrente] },
    'regata-templo-marinho': {
      main: TEMPLO.regataMarinhoFrente,
      hover: TEMPLO.regataMarinhoCostas,
      gallery: [TEMPLO.conjuntoMarinhoFrente],
    },
    'regata-templo-branco': { main: TEMPLO.regataBrancoFrente, hover: TEMPLO.regataBrancoCostas, gallery: [TEMPLO.conjuntoBrancoFrente] },
    'legging-templo-preto': { main: TEMPLO.leggingPretoFrente, hover: TEMPLO.leggingPretoCostas, gallery: [TEMPLO.conjuntoPretoFrente] },
    'legging-templo-marinho': {
      main: TEMPLO.leggingMarinhoFrente,
      hover: TEMPLO.leggingMarinhoCostas,
      gallery: [TEMPLO.conjuntoMarinhoFrente],
    },
    'shorts-forca-marinho': {
      main: FORCA.shortsMarinhoFrente,
      hover: FORCA.shortsMarinhoCostas,
      gallery: [FORCA.marinhoFrente],
    },
  } satisfies Record<string, ProductImages>,

  categories: {
    feminino: local(modelTeal, 'Modelo com conjunto feminino azul petróleo', '50% 20%'),
    masculino: local(modelMen, 'Modelo com conjunto masculino preto', '50% 20%'),
    conjuntos: FORCA.marinhoFrente,
    shorts: GRACA.shortsFrente,
    blusas: local(teeMen, 'Camiseta masculina preta', '50% 30%'),
  },

  benefits: local(fabricTeal, 'Close do tecido azul petróleo com costura de acabamento'),

  purpose: {
    faith: local(backBlack, 'Costas da regata preta Blessfit', '50% 30%'),
    strength: local(backMen, 'Costas da camiseta e bermuda pretas Blessfit', '50% 30%'),
    purpose: local(legsBlack, 'Legging preta Blessfit em movimento', '50% 50%'),
  },

  community: [
    local(modelBlack, 'Cliente com regata e legging pretas Blessfit'),
    local(topTeal, 'Top azul petróleo Blessfit'),
    local(shortsMen, 'Bermuda preta masculina Blessfit'),
    stock('photo-1541534741688-6078c6bfb5c5', 'Atleta com top branco segurando a barra'),
    local(modelTeal, 'Cliente com conjunto azul petróleo Blessfit'),
    stock('photo-1552848031-326ec03fe2ec', 'Atleta treinando bíceps com barra'),
  ],
}

export type ProductImageKey = keyof typeof IMAGES.products
