import {
  About,
  Benefits,
  CampaignHero,
  Categories,
  ChooseSet,
  HelpFaq,
  // Launches, // seção "Nova coleção · Lançamentos" oculta por enquanto
  Pieces,
  Reviews,
} from '@/sections'

/** Página da loja: composição das seções, na ordem em que aparecem. */
export function StorePage() {
  return (
    <main id="conteudo" tabIndex={-1}>
      <CampaignHero />
      {/* <Launches /> */}
      <Categories />
      <ChooseSet />
      <Pieces />
      <Benefits />
      <About />
      <Reviews />
      <HelpFaq />
    </main>
  )
}
