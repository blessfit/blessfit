import { BLOUSE_TIERS, isBlackFriday } from '@/lib/campaign'
import { requireAdmin } from '@/server/auth'
import { getCampaign } from '@/server/campaign'
import { CampaignEditor } from '../../_components/CampaignEditor'
import s from '../../admin.module.css'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default async function CampaignPage() {
  await requireAdmin()
  const campaign = await getCampaign()
  const live = isBlackFriday(campaign)
  const expired = campaign.blackFriday && !live

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Campanha</h1>
          <p>
            Liga o tema de Black Friday na loja (barra, banner, selos e cores em preto e branco) e o desconto progressivo nas
            blusas. Desligada, a loja volta exatamente ao que era antes.
          </p>
        </div>
      </div>

      <section className={s.card} style={{ marginBottom: 20 }}>
        <div className={s.cardHead}>
          <h2>Black Friday</h2>
          <span className={s.badge} data-status={live ? 'paid' : expired ? 'canceled' : undefined}>
            {live ? 'No ar' : expired ? 'Encerrada pela data' : 'Desligada'}
          </span>
        </div>
        {campaign.endsAt && (
          <p className={s.cardBody} style={{ paddingBottom: 0, margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            {live ? 'Termina' : 'Terminou'} em {formatDate(campaign.endsAt)}.
          </p>
        )}
        <CampaignEditor blackFriday={campaign.blackFriday} endsAt={campaign.endsAt} />
      </section>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2>Desconto nas blusas</h2>
        </div>
        <div className={s.cardBody} style={{ display: 'grid', gap: 10, fontSize: 14 }}>
          <p style={{ margin: 0 }}>
            {BLOUSE_TIERS.map((t, i) => `${t.min}${i === BLOUSE_TIERS.length - 1 ? ' ou mais' : ''} blusas: ${t.percent}%`).join(' · ')}
          </p>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            Vale para blusas avulsas (tops, regatas e camisetas), no Pix e no cartão, calculado no checkout. A blusa que vem
            dentro de um conjunto não conta. Cupom e promoção não somam: cada peça fica com o maior desconto. Para mudar os
            percentuais, edite <code>src/lib/campaign.ts</code>.
          </p>
        </div>
      </section>
    </>
  )
}
