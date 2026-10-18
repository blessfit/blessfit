/*
 * Texto da Política de Privacidade (/privacidade). Edite aqui e atualize `PRIVACY_UPDATED_AT`.
 * Descreve o que o site realmente coleta: se entrar um serviço novo (analytics, pixel, newsletter),
 * a política precisa ser atualizada junto.
 */
import { SHOP } from './shop'

export const PRIVACY_UPDATED_AT = '17 de outubro de 2026'

export type PrivacySection = {
  title: string
  /** Antes da lista. */
  paragraphs?: string[]
  items?: string[]
  /** Depois da lista. */
  note?: string
}

const { company } = SHOP

export const PRIVACY_INTRO = [
  `Esta política explica como a ${company.legalName} (“Blessfit”), CNPJ ${company.cnpj}, com sede na ${company.address}, coleta, usa e protege os seus dados pessoais quando você navega e compra em nosso site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).`,
  'Ao usar o site, você declara que leu e entendeu esta política.',
]

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: '1. Quais dados coletamos',
    items: [
      'Dados de cadastro e de compra: nome completo, CPF, e-mail, celular/WhatsApp e endereço de entrega.',
      'Dados da conta (se você criar uma): e-mail e senha — a senha é guardada de forma criptografada e nem nós temos acesso a ela. Se você entrar com o Google, recebemos apenas seu nome, e-mail e foto de perfil.',
      'Dados do pedido: peças compradas, valores, forma de pagamento escolhida, frete e código de rastreio.',
      'Pesquisas e listas de interesse: suas respostas e, só se você autorizar, nome e contato para avisarmos sobre lançamentos.',
      'Dados técnicos: endereço IP e informações do navegador, registrados automaticamente pelos servidores por motivos de segurança.',
    ],
    note: 'Não coletamos os dados do seu cartão: o pagamento é feito no ambiente da InfinitePay, que é quem processa e protege essas informações.',
  },
  {
    title: '2. Para que usamos os seus dados',
    items: [
      'Processar, entregar e acompanhar seus pedidos, inclusive gerar a etiqueta de envio.',
      'Emitir a nota fiscal (por isso o CPF é obrigatório).',
      'Falar com você sobre o pedido, trocas e devoluções, por e-mail ou WhatsApp.',
      'Manter sua conta, preencher seus dados nas próximas compras e mostrar seu histórico de pedidos.',
      'Aplicar cupons (por exemplo, conferir se é a sua primeira compra).',
      'Prevenir fraudes e manter o site seguro.',
      'Enviar novidades e lançamentos, somente se você autorizar — e você pode cancelar quando quiser.',
    ],
  },
  {
    title: '3. Bases legais (LGPD)',
    items: [
      'Execução de contrato: para vender, entregar e dar suporte ao seu pedido (art. 7º, V).',
      'Cumprimento de obrigação legal: emissão de nota fiscal e guarda de registros fiscais (art. 7º, II).',
      'Legítimo interesse: segurança do site e prevenção a fraudes (art. 7º, IX).',
      'Consentimento: contato para lançamentos e pesquisas (art. 7º, I), que pode ser retirado a qualquer momento.',
    ],
  },
  {
    title: '4. Com quem compartilhamos',
    paragraphs: ['Não vendemos seus dados. Compartilhamos apenas o necessário com os parceiros que fazem a loja funcionar:'],
    items: [
      'InfinitePay (CloudWalk): processamento do pagamento (nome, e-mail, telefone, endereço e valores do pedido).',
      'Melhor Envio, Correios e transportadoras: cálculo do frete, etiqueta e entrega (nome, CPF, telefone e endereço).',
      'Supabase: banco de dados e login da conta, onde os dados ficam armazenados.',
      'Vercel: hospedagem do site.',
      'Google: somente se você escolher “Continuar com o Google”.',
      'ViaCEP: consulta do endereço a partir do CEP digitado (só o CEP é enviado).',
      'Contador e órgãos públicos: quando exigido por lei, como na emissão da nota fiscal.',
    ],
  },
  {
    title: '5. Transferência internacional',
    paragraphs: [
      'Alguns desses parceiros (como Supabase, Vercel e Google) podem armazenar dados em servidores fora do Brasil. Nesses casos, escolhemos empresas que adotam padrões de segurança e proteção de dados compatíveis com a LGPD.',
    ],
  },
  {
    title: '6. Cookies e armazenamento no navegador',
    items: [
      'Sua sacola e o rascunho do checkout (sem o CPF) ficam salvos no seu próprio navegador, para você não perder o que escolheu.',
      'Se você entrar na sua conta, usamos cookies de sessão para manter o login.',
      'Não usamos cookies de publicidade nem ferramentas de rastreamento de terceiros.',
    ],
  },
  {
    title: '7. Por quanto tempo guardamos',
    items: [
      'Pedidos e dados fiscais: pelo prazo exigido pela legislação fiscal e de defesa do consumidor (em geral, 5 anos).',
      'Conta: enquanto ela estiver ativa. Ao excluir a conta, apagamos seus dados de cadastro; os pedidos já feitos são mantidos pelo prazo legal acima.',
      'Contatos de pesquisas e lançamentos: até você pedir a exclusão ou retirar o consentimento.',
    ],
  },
  {
    title: '8. Seus direitos',
    paragraphs: ['A qualquer momento, você pode pedir:'],
    items: [
      'Confirmação de que tratamos seus dados e acesso a eles.',
      'Correção de dados incompletos ou desatualizados (também dá para editar em “Minha conta”).',
      'Exclusão dos dados tratados com o seu consentimento e da sua conta (em “Minha conta” → “Excluir minha conta”).',
      'Informações sobre com quem compartilhamos seus dados.',
      'Portabilidade e revogação do consentimento.',
    ],
  },
  {
    title: '9. Segurança',
    paragraphs: [
      'O site usa conexão criptografada (HTTPS), as senhas são guardadas com criptografia e o acesso aos dados é restrito à equipe da loja. Mesmo assim, nenhum sistema é 100% imune: se acontecer um incidente que possa trazer risco a você, avisaremos e comunicaremos a ANPD, como manda a lei.',
    ],
  },
  {
    title: '10. Menores de idade',
    paragraphs: ['As compras devem ser feitas por maiores de 18 anos ou com a autorização de um responsável.'],
  },
  {
    title: '11. Fale com a gente',
    paragraphs: [
      `Para exercer seus direitos ou tirar dúvidas sobre esta política, fale com a gente pelo e-mail ${SHOP.email} ou pelo WhatsApp do site. Respondemos em até 15 dias.`,
      'Como microempresa, a Blessfit é dispensada de indicar um encarregado de dados (Resolução CD/ANPD nº 2/2022), e este canal cumpre essa função.',
    ],
  },
  {
    title: '12. Mudanças nesta política',
    paragraphs: [
      'Podemos atualizar esta política quando mudarmos a forma de tratar dados. A data da última atualização fica sempre no topo da página.',
    ],
  },
]
