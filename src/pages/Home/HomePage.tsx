import {
  Collection,
  Community,
  Details,
  Faq,
  Features,
  Hero,
  Manifesto,
  Marquee,
  Pillars,
  Verse,
} from '@/sections'

/** Landing page: composição das seções, na ordem em que aparecem. */
export function HomePage({ introDone }: { introDone: boolean }) {
  return (
    <main id="conteudo" tabIndex={-1}>
      <Hero ready={introDone} />
      <Marquee />
      <Manifesto />
      <Collection />
      <Details />
      <Features />
      <Verse />
      <Pillars />
      <Community />
      <Faq />
    </main>
  )
}
