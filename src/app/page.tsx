import { getCampaign } from '@/server/campaign'
import { getLiveCatalog } from '@/server/supabase'
import App from './App'

// a página é refeita no máximo a cada minuto (e na hora, quando o painel salva preço, estoque ou campanha)
export const revalidate = 60

export default async function Home() {
  const [live, campaign] = await Promise.all([getLiveCatalog(), getCampaign()])
  return <App live={live} campaign={campaign} />
}
