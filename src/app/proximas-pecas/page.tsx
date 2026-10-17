import type { Metadata, Viewport } from 'next'
import { isSurveyOpen, SURVEY } from '@/data/survey'
import { SurveyPage } from '@/views/Survey'

const description = `Conte quais peças, cores e tamanhos você quer na próxima coleção e ganhe ${SURVEY.coupon.percent}% OFF na próxima compra.`

export const metadata: Metadata = {
  title: `${SURVEY.title} · Blessfit`,
  description,
  // pesquisa com prazo: não deve ficar no Google depois de encerrada
  robots: { index: false },
  openGraph: {
    title: 'Você escolhe as próximas peças da Blessfit',
    description,
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
}

export const viewport: Viewport = { themeColor: '#2f3820' }

// refeita a cada hora: a data de encerramento é conferida no servidor
export const revalidate = 3600

export default function SurveyRoute() {
  return <SurveyPage closed={!isSurveyOpen()} />
}
