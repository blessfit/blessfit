import type { Metadata } from 'next'
import { PrivacyPage } from '@/views/Privacy/PrivacyPage'

export const metadata: Metadata = {
  title: 'Política de Privacidade · Blessfit',
  description: 'Como a Blessfit coleta, usa e protege os seus dados pessoais (LGPD).',
}

export default function PrivacyRoute() {
  return <PrivacyPage />
}
