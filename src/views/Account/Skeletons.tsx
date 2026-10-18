'use client'

/*
 * Carregamento das telas da conta (loading.tsx): aparece na hora do clique, no lugar do conteúdo.
 */
import * as S from './Account.styles'

export function OrdersSkeleton() {
  return (
    <S.Card aria-busy="true" aria-label="Carregando pedidos">
      <S.Bone $w="160px" $h={22} />
      <div style={{ display: 'grid', marginTop: 16 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px', padding: '14px 0', borderTop: i ? '1px solid var(--line)' : 0 }}>
            <S.Bone $w="140px" />
            <S.Bone $w="110px" $h={20} />
            <S.Bone $w="120px" $h={12} />
            <S.Bone $w="70px" $h={12} />
          </div>
        ))}
      </div>
    </S.Card>
  )
}

export function ProfileSkeleton() {
  const field = (w = '100%') => (
    <div style={{ display: 'grid', gap: 8 }}>
      <S.Bone $w="90px" $h={12} />
      <S.Bone $w={w} $h={44} />
    </div>
  )
  return (
    <S.Card aria-busy="true" aria-label="Carregando seus dados">
      <S.Bone $w="140px" $h={22} />
      <S.Bone $w="70%" $h={14} style={{ marginTop: 10 }} />
      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {field()}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {field()}
          {field()}
        </div>
        {field()}
        <S.Bone $w="170px" $h={18} style={{ marginTop: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
          {field()}
          {field()}
        </div>
        {field()}
        <S.Bone $w="140px" $h={48} style={{ borderRadius: 999 }} />
      </div>
    </S.Card>
  )
}
