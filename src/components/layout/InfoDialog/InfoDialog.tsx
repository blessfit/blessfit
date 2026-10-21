import styled from 'styled-components'
import { Button, Dialog, WhatsApp } from '@/components/ui'
import { INFO_PAGES } from '@/data/content'
import { external, whatsappUrl } from '@/lib/links'
import { useStore } from '@/store/storeContext'

const Body = styled.div`
  display: grid;
  gap: 14px;
  padding: 24px;
  color: var(--text-muted);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;

  caption {
    padding-bottom: 6px;
    color: var(--ink);
    font-weight: 700;
    text-align: left;
  }

  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid var(--line);
  }

  th {
    color: var(--ink);
    font-size: 12px;
    font-weight: 700;
  }

  td:first-child {
    color: var(--ink);
    font-weight: 700;
  }
`

/** Janela com política de troca, entrega, pagamento ou guia de tamanhos (aberta pelo rodapé). */
export function InfoDialog() {
  const { info, closeInfo } = useStore()
  const page = INFO_PAGES.find((p) => p.id === info)

  return (
    <Dialog open={page !== undefined} onClose={closeInfo} title={page?.title ?? ''} width={620}>
      {page && (
        <Body>
          {page.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {page.tables?.map((table) => (
            <Table key={table.title}>
              <caption>{table.title}</caption>
              <thead>
                <tr>
                  {table.head.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          ))}
          {page.note && <p>{page.note}</p>}
          <Button
            variant="primary"
            glyph={WhatsApp}
            href={whatsappUrl(`Olá! Tenho uma dúvida sobre: ${page.title}.`)}
            {...external}
          >
            Tirar dúvida no WhatsApp
          </Button>
        </Body>
      )}
    </Dialog>
  )
}
