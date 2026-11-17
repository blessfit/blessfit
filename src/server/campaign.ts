/*
 * Campanha da loja salva no banco (site_settings, chave 'campaign'), editada em /admin/campanha.
 */
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { NO_CAMPAIGN, type Campaign } from '@/lib/campaign'
import { db } from './supabase'

const KEY = 'campaign'

function parse(value: unknown): Campaign {
  const raw = (value ?? {}) as Partial<Campaign>
  return {
    blackFriday: raw.blackFriday === true,
    endsAt: typeof raw.endsAt === 'string' && !Number.isNaN(Date.parse(raw.endsAt)) ? raw.endsAt : null,
  }
}

/**
 * Campanha atual. Se o banco não responder, volta "sem campanha": o site fica no tema normal e
 * o checkout não dá o desconto (nunca cobra a menos por engano).
 */
export async function getCampaign(): Promise<Campaign> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return NO_CAMPAIGN
  const client = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await client.from('site_settings').select('value').eq('key', KEY).maybeSingle<{ value: unknown }>()
  if (error) {
    console.error(`[campaign] erro ao ler a campanha: ${error.message} (${error.code})`)
    return NO_CAMPAIGN
  }
  return data ? parse(data.value) : NO_CAMPAIGN
}

/** Salva pelo painel (chave secreta). */
export async function saveCampaign(campaign: Campaign): Promise<void> {
  const { error } = await db()
    .from('site_settings')
    .upsert({ key: KEY, value: campaign, updated_at: new Date().toISOString() })
  if (error) throw error
}
