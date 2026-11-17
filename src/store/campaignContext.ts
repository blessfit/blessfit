import { createContext, useContext } from 'react'
import { freeShippingFrom, NO_CAMPAIGN, type Campaign } from '@/lib/campaign'

/** Campanha que a página trouxe do banco. `active`: a Black Friday está valendo nesta renderização. */
export type CampaignState = Campaign & { active: boolean }

export const CampaignContext = createContext<CampaignState>({ ...NO_CAMPAIGN, active: false })

export const useCampaign = () => useContext(CampaignContext)

/** Valor mínimo do frete grátis em reais, ou null na Black Friday (sem frete grátis por valor). */
export const useFreeShippingFrom = () => freeShippingFrom(useCampaign().active)
