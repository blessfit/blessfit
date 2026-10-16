import Link from 'next/link'
import { isSurveyOpen, labelOf, SURVEY, SURVEY_COLORS, SURVEY_PIECES, SURVEY_PRICES } from '@/data/survey'
import { SITE_URL } from '@/lib/site'
import { requireAdmin } from '@/server/auth'
import { formatPhone, listSurveyResponses, surveySummary, type Tally } from '@/server/survey'
import { removeSurveyContact } from '../../actions'
import { CopyLinkButton } from '../../_components/CopyLinkButton'
import { ExportButton } from '../../_components/ExportButton'
import { CheckIcon, SurveyIcon, WhatsAppIcon } from '../../_components/Icons'
import { SubmitButton } from '../../_components/Pending'
import s from '../../admin.module.css'
import { formatDate } from '../../labels'

const closes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date(SURVEY.closesAt))

function Bars({ items, tone, empty }: { items: Tally[]; tone?: 'petrol'; empty: string }) {
  const max = Math.max(1, ...items.map((t) => t.count))
  if (!items.some((t) => t.count)) return <p className={s.empty}>{empty}</p>
  return (
    <div className={s.bars}>
      {items.map((t) => (
        <div key={t.id} className={s.barRow}>
          <span title={t.label}>
            {t.hex && <span className={s.swatchDot} style={{ background: t.hex }} />}
            {t.label}
          </span>
          <span className={s.barTrack}>
            <span className={s.barFill} data-tone={tone} style={{ display: 'block', width: `${(t.count / max) * 100}%` }} />
          </span>
          <span>{t.count}</span>
        </div>
      ))}
    </div>
  )
}

/** Pesquisa “Próximas peças”: totais, grade de tamanhos por peça e últimas respostas. */
export default async function SurveyAdminPage({ searchParams }: { searchParams: Promise<{ peca?: string }> }) {
  await requireAdmin()
  const params = await searchParams
  const piece = SURVEY_PIECES.some((p) => p.id === params.peca) ? params.peca : undefined
  const rows = await listSurveyResponses()
  const sum = surveySummary(rows, piece)
  const maxShare = Math.max(1, ...sum.sizes.map((t) => t.share))
  const link = `${SITE_URL}/proximas-pecas`

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Próximas peças</h1>
          <p>
            {SURVEY.title} · {isSurveyOpen() ? `aberta até ${closes}` : 'encerrada'}
          </p>
        </div>
        <div className={s.actions}>
          <CopyLinkButton url={link} label="Copiar link da pesquisa" />
          <ExportButton href="/admin/proximas-pecas/exportar" fallbackName="proximas-pecas-blessfit.xlsx" />
        </div>
      </div>

      <div className={s.stats}>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon}>
            <SurveyIcon />
          </span>
          <div className={s.statLabel}>Respostas</div>
          <div className={s.statValue}>{sum.total}</div>
          <div className={s.statHint}>{rows[0] ? `última em ${formatDate(rows[0].created_at)}` : 'nenhuma ainda'}</div>
        </div>
        <div className={`${s.card} ${s.stat}`}>
          <span className={s.statIcon} data-tone="petrol">
            <WhatsAppIcon />
          </span>
          <div className={s.statLabel}>Querem ser avisadas</div>
          <div className={s.statValue}>{sum.withContact}</div>
          <div className={s.statHint}>com autorização para receber mensagens</div>
        </div>
        <div className={`${s.card} ${s.stat} ${s.highlight}`}>
          <div className={s.statLabel}>Mais pedido</div>
          <div className={s.statValue} style={{ fontSize: 20 }}>
            {sum.top.piece ? `${sum.top.piece} · ${sum.top.color}` : '—'}
          </div>
          <div className={s.statHint}>{sum.top.size ? `tamanho ${sum.top.size} · ${sum.top.price}` : 'aparece com as primeiras respostas'}</div>
        </div>
      </div>

      <div className={s.columns} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', marginBottom: 20 }}>
        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Peças mais pedidas</h2>
          </div>
          <Bars items={sum.pieces} empty="As peças aparecem aqui com as primeiras respostas." />
        </section>
        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Cores mais pedidas</h2>
          </div>
          <Bars items={sum.colors} tone="petrol" empty="As cores aparecem aqui com as primeiras respostas." />
        </section>

        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Grade de tamanhos</h2>
            <span className={s.statHint}>{sum.filtered} resposta(s)</span>
          </div>
          <nav className={s.chips} aria-label="Grade por peça" style={{ padding: '14px 20px 0' }}>
            <Link href="/admin/proximas-pecas" className={s.chip} aria-current={!piece}>
              Todas
            </Link>
            {sum.pieces.map((p) => (
              <Link key={p.id} href={`/admin/proximas-pecas?peca=${p.id}`} className={s.chip} aria-current={piece === p.id}>
                {p.label}
              </Link>
            ))}
          </nav>
          <div className={s.sizeChart}>
            {sum.sizes.map((t) => (
              <div key={t.id}>
                <span>{t.share}%</span>
                <span style={{ height: `${(t.share / maxShare) * 110}px` }} />
              </div>
            ))}
          </div>
          <div className={s.sizeLabels}>
            {sum.sizes.map((t) => (
              <span key={t.id}>{t.label}</span>
            ))}
          </div>
        </section>

        <section className={s.card}>
          <div className={s.cardHead}>
            <h2>Quanto pagariam por um conjunto</h2>
          </div>
          <Bars items={sum.prices} empty="As faixas aparecem aqui com as primeiras respostas." />
          {sum.otherColors.length > 0 && (
            <div className={s.cardBody} style={{ borderTop: '1px solid var(--line)' }}>
              <div className={s.statLabel}>Outras cores sugeridas</div>
              <p style={{ margin: '6px 0 0' }}>{sum.otherColors.map((o) => `${o.label} (${o.count})`).join(' · ')}</p>
            </div>
          )}
        </section>
      </div>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2>Últimas respostas</h2>
          <span className={s.statHint}>a planilha tem todas</span>
        </div>
        {rows.length === 0 ? (
          <p className={s.empty}>Nenhuma resposta ainda. Copie o link da pesquisa e mande para as clientes.</p>
        ) : (
          <>
            <div className={`${s.surveyRow} ${s.orderHeader}`}>
              <span>Cliente</span>
              <span>Peças</span>
              <span>Cores</span>
              <span>Tam.</span>
              <span>Pagaria</span>
              <span>Aviso</span>
            </div>
            {rows.slice(0, 20).map((r) => (
              <div key={r.id} className={s.surveyRow}>
                <span>
                  <span className={s.cellMain}>{r.name ?? (r.consent ? 'Sem nome' : 'Anônima')}</span>
                  <span className={s.cellSub}>
                    {formatDate(r.created_at)}
                    {r.phone && ` · ${formatPhone(r.phone)}`}
                    {r.email && ` · ${r.email}`}
                  </span>
                </span>
                <span>{r.pieces.map((id) => labelOf(SURVEY_PIECES, id)).join(', ')}</span>
                <span>{r.colors.map((id) => labelOf(SURVEY_COLORS, id)).join(', ')}</span>
                <span style={{ fontWeight: 700 }}>{r.size}</span>
                <span>{labelOf(SURVEY_PRICES, r.price_range)}</span>
                {r.consent ? (
                  <form action={removeSurveyContact}>
                    <input type="hidden" name="id" value={r.id} />
                    <span className={s.status} data-tone="ok" style={{ marginRight: 8 }}>
                      <CheckIcon /> {r.phone ? 'WhatsApp' : 'E-mail'}
                    </span>
                    <SubmitButton className={`${s.button} ${s.secondary}`} pendingLabel="Removendo…">
                      Remover contato
                    </SubmitButton>
                  </form>
                ) : (
                  <span className={s.statHint}>Não</span>
                )}
              </div>
            ))}
          </>
        )}
      </section>
    </>
  )
}
