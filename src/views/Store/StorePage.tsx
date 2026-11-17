import {
  About,
  Benefits,
  BlackFridayHero,
  BlackFridaySteps,
  BlackFridayTicker,
  CampaignHero,
  Categories,
  ChooseSet,
  HelpFaq,
  // Launches, // seção "Nova coleção · Lançamentos" oculta por enquanto
  Pieces,
  Reviews,
} from '@/sections'
import { useCampaign } from '@/store/campaignContext'

/**
 * Página da loja: composição das seções, na ordem em que aparecem.
 * Com a Black Friday ligada no painel, o carrossel dá lugar ao banner da campanha e entra a seção da promoção.
 */
export function StorePage() {
  const { active: blackFriday } = useCampaign()

  return (
    <main id="conteudo" tabIndex={-1}>
      {blackFriday ? (
        <>
          <BlackFridayHero />
          <BlackFridayTicker />
          <BlackFridaySteps />
        </>
      ) : (
        <CampaignHero />
      )}
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
