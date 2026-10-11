import styled from 'styled-components'
import type { Img } from '@/data/images'

type PictureProps = {
  image: Img
  /** Largura em que a imagem aparece (ajuda o navegador a baixar o tamanho certo). */
  sizes?: string
  /** Imagem acima da dobra: carrega na hora e com prioridade. */
  priority?: boolean
  /** Carrega já, sem esperar entrar na tela (ex.: slides do carrossel), mas sem prioridade alta. */
  eager?: boolean
  /** Imagem só decorativa (alt vazio). */
  decorative?: boolean
  className?: string
}

const Cover = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

/** Foto que preenche o contêiner, com srcset, lazy-loading e ponto focal vindos de data/images.ts. */
export function Picture({ image, sizes = '100vw', priority, eager, decorative, className }: PictureProps) {
  return (
    <Cover
      className={className}
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      alt={decorative ? '' : image.alt}
      loading={priority || eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  )
}
