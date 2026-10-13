import { getLiveCatalog } from '@/server/supabase'
import App from './App'

// a página é refeita no máximo a cada minuto (e na hora, quando o painel salva preço ou estoque)
export const revalidate = 60

export default async function Home() {
  return <App live={await getLiveCatalog()} />
}
