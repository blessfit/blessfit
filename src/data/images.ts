/*
 * TODAS as imagens da loja ficam aqui.
 *
 * Para trocar pelas fotos oficiais da Blessfit:
 *   1. coloque o arquivo em src/assets/img/ (de preferência .webp, ~1200px no lado maior);
 *   2. importe no topo deste arquivo (ex.: `import conjuntoAurora from '@/assets/img/conjunto-aurora.webp'`);
 *   3. troque a entrada desejada por `local(conjuntoAurora, 'texto alternativo')`
 *      (ou `sized(foto900, foto1600, 'texto')` se tiver a foto em dois tamanhos, como as do Maré e do Impulso).
 *
 * Cada COR de produto tem o seu conjunto de fotos em IMAGES.products (ex.: 'conjunto-impulso-preto'
 * e 'conjunto-impulso-marinho'); em src/data/products.ts cada cor aponta para a sua chave.
 *
 * As fotos `stock(...)` são do Unsplash (licença livre) e servem só como placeholder nesta primeira versão.
 */
import fabricTeal from '@/assets/img/fabric-teal.webp'
import modelBlack from '@/assets/img/model-black.webp'
import modelMen from '@/assets/img/model-men.webp'
import modelTeal from '@/assets/img/model-teal.webp'
import shortsMen from '@/assets/img/shorts-men.webp'
import teeMen from '@/assets/img/tee-men.webp'
import topTeal from '@/assets/img/top-teal.webp'
// Conjunto Maré (azul petróleo) — fotos geradas no Google Flow a partir das peças reais
import mareCostas900 from '@/assets/img/mare/costas-900.webp'
import mareCostas1600 from '@/assets/img/mare/costas-1600.webp'
import mareFrente900 from '@/assets/img/mare/frente-900.webp'
import mareFrente1600 from '@/assets/img/mare/frente-1600.webp'
import mareShortsCostas900 from '@/assets/img/mare/shorts-costas-900.webp'
import mareShortsCostas1600 from '@/assets/img/mare/shorts-costas-1600.webp'
import mareShortsFrente900 from '@/assets/img/mare/shorts-frente-900.webp'
import mareShortsFrente1600 from '@/assets/img/mare/shorts-frente-1600.webp'
import mareTopCostas900 from '@/assets/img/mare/top-costas-900.webp'
import mareTopCostas1600 from '@/assets/img/mare/top-costas-1600.webp'
import mareTopFrente900 from '@/assets/img/mare/top-frente-900.webp'
import mareTopFrente1600 from '@/assets/img/mare/top-frente-1600.webp'
// Conjunto Impulso (preto e azul marinho) — fotos geradas no Google Flow a partir das peças reais
import impulsoCamisetaMarinho900 from '@/assets/img/impulso/camiseta-marinho-900.webp'
import impulsoCamisetaMarinho1600 from '@/assets/img/impulso/camiseta-marinho-1600.webp'
import impulsoCamisetaPreto900 from '@/assets/img/impulso/camiseta-preto-900.webp'
import impulsoCamisetaPreto1600 from '@/assets/img/impulso/camiseta-preto-1600.webp'
import impulsoMarinhoFrente900 from '@/assets/img/impulso/conjunto-marinho-frente-900.webp'
import impulsoMarinhoFrente1600 from '@/assets/img/impulso/conjunto-marinho-frente-1600.webp'
import impulsoPretoCostas900 from '@/assets/img/impulso/conjunto-preto-costas-900.webp'
import impulsoPretoCostas1600 from '@/assets/img/impulso/conjunto-preto-costas-1600.webp'
import impulsoPretoFrente900 from '@/assets/img/impulso/conjunto-preto-frente-900.webp'
import impulsoPretoFrente1600 from '@/assets/img/impulso/conjunto-preto-frente-1600.webp'
import impulsoShortsMarinhoCostas900 from '@/assets/img/impulso/shorts-marinho-costas-900.webp'
import impulsoShortsMarinhoCostas1600 from '@/assets/img/impulso/shorts-marinho-costas-1600.webp'
import impulsoShortsMarinhoFrente900 from '@/assets/img/impulso/shorts-marinho-frente-900.webp'
import impulsoShortsMarinhoFrente1600 from '@/assets/img/impulso/shorts-marinho-frente-1600.webp'
import impulsoShortsPretoCostas900 from '@/assets/img/impulso/shorts-preto-costas-900.webp'
import impulsoShortsPretoCostas1600 from '@/assets/img/impulso/shorts-preto-costas-1600.webp'
import impulsoShortsPretoFrente900 from '@/assets/img/impulso/shorts-preto-frente-900.webp'
import impulsoShortsPretoFrente1600 from '@/assets/img/impulso/shorts-preto-frente-1600.webp'
// Pilares Conforto · Performance · Estilo (seção “Sobre a Blessfit”) — fotos geradas no Google Flow
import sobreConforto900 from '@/assets/img/sobre/conforto-900.webp'
import sobreConforto1600 from '@/assets/img/sobre/conforto-1600.webp'
import sobreEstilo900 from '@/assets/img/sobre/estilo-900.webp'
import sobreEstilo1600 from '@/assets/img/sobre/estilo-1600.webp'
import sobrePerformance900 from '@/assets/img/sobre/performance-900.webp'
import sobrePerformance1600 from '@/assets/img/sobre/performance-1600.webp'

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

// Conjunto Brisa (regata + legging) — fotos geradas no Google Flow a partir das peças reais
const brisa = folder(
  import.meta.glob<string>('../assets/img/brisa/*.webp', { eager: true, import: 'default' }),
  'brisa',
)

const BRISA = {
  conjuntoPretoFrente: brisa('conjunto-preto-frente', 'Modelo de frente com o Conjunto Brisa preto: regata estampada e legging', '50% 30%'),
  conjuntoPretoCostas: brisa('conjunto-preto-costas', 'Modelo de costas com o Conjunto Brisa preto e o logo blessfit no cós', '50% 30%'),
  conjuntoMarinhoFrente: brisa('conjunto-marinho-frente', 'Modelo de frente com o Conjunto Brisa azul marinho: regata estampada e legging', '50% 30%'),
  conjuntoMarinhoCostas: brisa('conjunto-marinho-costas', 'Modelo de costas com o Conjunto Brisa azul marinho e o logo blessfit no cós', '50% 30%'),
  conjuntoBrancoFrente: brisa('conjunto-branco-frente', 'Modelo de frente com a regata branca estampada e legging preta', '50% 30%'),
  conjuntoBrancoCostas: brisa('conjunto-branco-costas', 'Modelo de costas com a regata branca e legging preta com o logo blessfit', '50% 30%'),
  regataPretoFrente: brisa('regata-preto-frente', 'Regata preta com estampa blessfit, de frente', '50% 25%'),
  regataPretoCostas: brisa('regata-preto-costas', 'Costas da regata preta com cava aberta', '50% 25%'),
  regataMarinhoFrente: brisa('regata-marinho-frente', 'Regata azul marinho com estampa blessfit, de frente', '50% 25%'),
  regataMarinhoCostas: brisa('regata-marinho-costas', 'Costas da regata azul marinho com o logo blessfit na barra', '50% 25%'),
  regataBrancoFrente: brisa('regata-branco-frente', 'Regata branca com estampa blessfit, de frente', '50% 25%'),
  regataBrancoCostas: brisa('regata-branco-costas', 'Costas da regata branca com barra arredondada', '50% 25%'),
  leggingPretoFrente: brisa('legging-preto-frente', 'Legging preta de cós alto com logo b.f, de frente', '50% 55%'),
  leggingPretoCostas: brisa('legging-preto-costas', 'Legging preta de costas com o logo blessfit no cós', '50% 55%'),
  leggingMarinhoFrente: brisa('legging-marinho-frente', 'Legging azul marinho de cós alto com logo b.f, de frente', '50% 55%'),
  leggingMarinhoCostas: brisa('legging-marinho-costas', 'Legging azul marinho de costas com o logo blessfit no cós', '50% 55%'),
}

// Regata masculina Fôlego (preto e azul marinho) — fotos geradas no Google Flow a partir das peças reais
const folego = folder(
  import.meta.glob<string>('../assets/img/folego/*.webp', { eager: true, import: 'default' }),
  'folego',
)

const FOLEGO = {
  regataPretoFrente: folego('regata-preto-frente', 'Regata masculina preta com o logo b.f no peito', '50% 20%'),
  regataPretoCostas: folego('regata-preto-costas', 'Costas da regata masculina preta com o logo blessfit', '50% 20%'),
  regataMarinhoFrente: folego('regata-marinho-frente', 'Regata masculina azul marinho com o logo b.f no peito', '50% 20%'),
  regataMarinhoCostas: folego('regata-marinho-costas', 'Costas da regata masculina azul marinho com o logo blessfit', '50% 20%'),
  conjuntoPretoCostas: folego('conjunto-preto-costas', 'Modelo de costas com regata e shorts pretos Blessfit', '50% 30%'),
  conjuntoMarinhoCostas: folego('conjunto-marinho-costas', 'Modelo de costas com regata e shorts azul marinho Blessfit', '50% 30%'),
}

// Conjunto Aurora (preto: top nadador + legging) — fotos geradas no Google Flow a partir das peças reais
const aurora = folder(
  import.meta.glob<string>('../assets/img/aurora/*.webp', { eager: true, import: 'default' }),
  'aurora',
)

const AURORA = {
  conjuntoFrente: aurora('conjunto-preto-frente', 'Modelo de frente com o Conjunto Aurora preto: top nadador e legging', '50% 30%'),
  conjuntoCostas: aurora('conjunto-preto-costas', 'Modelo de costas com o Conjunto Aurora preto e o logo blessfit no top e no cós', '50% 30%'),
  topFrente: aurora('top-preto-frente', 'Top nadador preto com o logo b.f, de frente', '50% 30%'),
  topCostas: aurora('top-preto-costas', 'Costas do top nadador preto com o logo blessfit', '50% 30%'),
}

const MARE = {
  frente: sized(mareFrente900, mareFrente1600, 'Modelo de frente com o Conjunto Maré azul petróleo: top de alças finas e shorts de cós alto', '50% 30%'),
  costas: sized(mareCostas900, mareCostas1600, 'Modelo de costas com o Conjunto Maré, mostrando as alças cruzadas e o logo blessfit', '50% 30%'),
  topFrente: sized(mareTopFrente900, mareTopFrente1600, 'Top azul petróleo de frente, com o logo b.f'),
  topCostas: sized(mareTopCostas900, mareTopCostas1600, 'Costas do top com alças cruzadas em Y e o logo blessfit'),
  shortsFrente: sized(mareShortsFrente900, mareShortsFrente1600, 'Shorts azul petróleo de cós alto, de frente, com o logo b.f', '50% 25%'),
  shortsCostas: sized(mareShortsCostas900, mareShortsCostas1600, 'Shorts azul petróleo de costas, com o logo blessfit no cós', '50% 25%'),
}

const IMPULSO = {
  pretoFrente: sized(impulsoPretoFrente900, impulsoPretoFrente1600, 'Modelo de frente com o Conjunto Impulso preto: camiseta raglan e shorts com cordão', '50% 30%'),
  pretoCostas: sized(impulsoPretoCostas900, impulsoPretoCostas1600, 'Modelo de costas com o Conjunto Impulso preto e o logo blessfit na camiseta', '50% 30%'),
  marinhoFrente: sized(impulsoMarinhoFrente900, impulsoMarinhoFrente1600, 'Modelo de frente com o Conjunto Impulso azul marinho: camiseta raglan e shorts com cordão', '50% 30%'),
  camisetaPreto: sized(impulsoCamisetaPreto900, impulsoCamisetaPreto1600, 'Camiseta raglan preta com o logo b.f no peito'),
  camisetaMarinho: sized(impulsoCamisetaMarinho900, impulsoCamisetaMarinho1600, 'Camiseta raglan azul marinho com o logo b.f no peito'),
  shortsPretoFrente: sized(impulsoShortsPretoFrente900, impulsoShortsPretoFrente1600, 'Shorts masculino preto com cordão e logo b.f, de frente', '50% 25%'),
  shortsPretoCostas: sized(impulsoShortsPretoCostas900, impulsoShortsPretoCostas1600, 'Shorts masculino preto de costas', '50% 25%'),
  shortsMarinhoFrente: sized(impulsoShortsMarinhoFrente900, impulsoShortsMarinhoFrente1600, 'Shorts masculino azul marinho com cordão e logo b.f, de frente', '50% 25%'),
  shortsMarinhoCostas: sized(impulsoShortsMarinhoCostas900, impulsoShortsMarinhoCostas1600, 'Shorts masculino azul marinho de costas', '50% 25%'),
}

export const IMAGES = {
  /**
   * Slides do banner principal (carrossel), na mesma ordem de HERO_SLIDES (src/data/shop.ts).
   * Fotos horizontais 16:9 em src/assets/img/banner (nome-900/1600/2400.webp).
   */
  heroSlides: [
    banner('colecao', 'Casal caminhando à beira-mar com os conjuntos Maré azul petróleo e Impulso preto', '65% 50%'),
    banner('masculino', 'Homem sentado em escadaria de pedra com o Conjunto Impulso azul marinho', '30% 50%'),
    banner('feminino', 'Mulher se alongando em um deck de frente para o mar com o Conjunto Maré azul petróleo', '68% 50%'),
    banner('pecas', 'Amigos descansando em um terraço ensolarado com top Maré e camiseta Impulso', '35% 50%'),
  ],

  /** Uma entrada por produto + cor. */
  products: {
    // ——— Conjuntos femininos ———
    'conjunto-mare-petroleo': {
      main: MARE.frente,
      hover: MARE.costas,
      gallery: [MARE.topFrente, MARE.topCostas, MARE.shortsFrente, MARE.shortsCostas],
    },
    'conjunto-aurora-preto': {
      main: AURORA.conjuntoFrente,
      hover: AURORA.conjuntoCostas,
      gallery: [AURORA.topFrente, AURORA.topCostas],
    },
    'conjunto-brisa-preto': {
      main: BRISA.conjuntoPretoFrente,
      hover: BRISA.conjuntoPretoCostas,
      gallery: [BRISA.regataPretoFrente, BRISA.regataPretoCostas, BRISA.leggingPretoFrente, BRISA.leggingPretoCostas],
    },
    'conjunto-brisa-marinho': {
      main: BRISA.conjuntoMarinhoFrente,
      hover: BRISA.conjuntoMarinhoCostas,
      gallery: [
        BRISA.regataMarinhoFrente,
        BRISA.regataMarinhoCostas,
        BRISA.leggingMarinhoFrente,
        BRISA.leggingMarinhoCostas,
      ],
    },
    'conjunto-brisa-branco': {
      main: BRISA.conjuntoBrancoFrente,
      hover: BRISA.conjuntoBrancoCostas,
      gallery: [BRISA.regataBrancoFrente, BRISA.regataBrancoCostas, BRISA.leggingPretoFrente, BRISA.leggingPretoCostas],
    },

    // ——— Conjuntos masculinos ———
    'conjunto-impulso-preto': {
      main: IMPULSO.pretoFrente,
      hover: IMPULSO.pretoCostas,
      gallery: [IMPULSO.camisetaPreto, IMPULSO.shortsPretoFrente, IMPULSO.shortsPretoCostas],
    },
    'conjunto-impulso-marinho': {
      main: IMPULSO.marinhoFrente,
      hover: IMPULSO.camisetaMarinho,
      gallery: [IMPULSO.shortsMarinhoFrente, IMPULSO.shortsMarinhoCostas],
    },
    // Fôlego = regata masculina + o mesmo Shorts Impulso
    'conjunto-folego-preto': {
      main: FOLEGO.regataPretoFrente,
      hover: FOLEGO.conjuntoPretoCostas,
      gallery: [FOLEGO.regataPretoCostas, IMPULSO.shortsPretoFrente, IMPULSO.shortsPretoCostas],
    },
    'conjunto-folego-marinho': {
      main: FOLEGO.regataMarinhoFrente,
      hover: FOLEGO.conjuntoMarinhoCostas,
      gallery: [FOLEGO.regataMarinhoCostas, IMPULSO.shortsMarinhoFrente, IMPULSO.shortsMarinhoCostas],
    },

    // ——— Peças avulsas ———
    'regata-folego-preto': {
      main: FOLEGO.regataPretoFrente,
      hover: FOLEGO.regataPretoCostas,
      gallery: [FOLEGO.conjuntoPretoCostas],
    },
    'regata-folego-marinho': {
      main: FOLEGO.regataMarinhoFrente,
      hover: FOLEGO.regataMarinhoCostas,
      gallery: [FOLEGO.conjuntoMarinhoCostas],
    },
    'top-mare-petroleo': { main: MARE.topFrente, hover: MARE.topCostas, gallery: [MARE.frente, MARE.costas] },
    'shorts-mare-petroleo': { main: MARE.shortsFrente, hover: MARE.shortsCostas, gallery: [MARE.frente] },
    'camiseta-impulso-preto': { main: IMPULSO.camisetaPreto, hover: IMPULSO.pretoCostas, gallery: [IMPULSO.pretoFrente] },
    'camiseta-impulso-marinho': { main: IMPULSO.camisetaMarinho, hover: IMPULSO.marinhoFrente },
    'shorts-impulso-preto': { main: IMPULSO.shortsPretoFrente, hover: IMPULSO.shortsPretoCostas, gallery: [IMPULSO.pretoFrente] },
    'regata-brisa-preto': { main: BRISA.regataPretoFrente, hover: BRISA.regataPretoCostas, gallery: [BRISA.conjuntoPretoFrente] },
    'regata-brisa-marinho': {
      main: BRISA.regataMarinhoFrente,
      hover: BRISA.regataMarinhoCostas,
      gallery: [BRISA.conjuntoMarinhoFrente],
    },
    'regata-brisa-branco': { main: BRISA.regataBrancoFrente, hover: BRISA.regataBrancoCostas, gallery: [BRISA.conjuntoBrancoFrente] },
    'legging-brisa-preto': { main: BRISA.leggingPretoFrente, hover: BRISA.leggingPretoCostas, gallery: [BRISA.conjuntoPretoFrente] },
    'legging-brisa-marinho': {
      main: BRISA.leggingMarinhoFrente,
      hover: BRISA.leggingMarinhoCostas,
      gallery: [BRISA.conjuntoMarinhoFrente],
    },
    'shorts-impulso-marinho': {
      main: IMPULSO.shortsMarinhoFrente,
      hover: IMPULSO.shortsMarinhoCostas,
      gallery: [IMPULSO.marinhoFrente],
    },
  } satisfies Record<string, ProductImages>,

  categories: {
    feminino: local(modelTeal, 'Modelo com conjunto feminino azul petróleo', '50% 20%'),
    masculino: local(modelMen, 'Modelo com conjunto masculino preto', '50% 20%'),
    conjuntos: IMPULSO.marinhoFrente,
    shorts: MARE.shortsFrente,
    blusas: local(teeMen, 'Camiseta masculina preta', '50% 30%'),
  },

  benefits: local(fabricTeal, 'Close do tecido azul petróleo com costura de acabamento'),

  /** Fotos dos três pilares da seção “Sobre a Blessfit”. */
  about: {
    comfort: sized(
      sobreConforto900,
      sobreConforto1600,
      'Mulher de costas com regata preta e legging preta Blessfit, com o logo blessfit no cós',
      '50% 25%',
    ),
    performance: sized(
      sobrePerformance900,
      sobrePerformance1600,
      'Homem com camiseta preta Blessfit fazendo rosca martelo com halter na academia',
      '50% 25%',
    ),
    style: sized(
      sobreEstilo900,
      sobreEstilo1600,
      'Pernas de mulher com legging preta e tênis branco subindo um degrau de concreto',
      '50% 55%',
    ),
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
