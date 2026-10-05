import { motion } from 'motion/react'
import styled from 'styled-components'
import { Star as StarIcon } from '@/components/ui'

export const Band = styled.div`
  position: relative;
  z-index: 2;
  width: 106vw;
  margin: clamp(-44px, -3vw, -24px) 0 clamp(-44px, -3vw, -24px) -3vw;
  background: var(--cream);
  color: var(--ink);
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.28);
  transform: rotate(-2deg);
`

export const Viewport = styled.div`
  overflow: hidden;
  padding-block: clamp(10px, 1.4vw, 20px);
`

export const Track = styled(motion.div)`
  display: flex;
  width: max-content;
  will-change: transform;
`

export const Group = styled.div`
  display: flex;
  flex: none;
  align-items: center;
`

export const Item = styled.span`
  padding-inline: clamp(18px, 2.2vw, 36px);
  font-size: clamp(2.2rem, 5.4vw, 5.2rem);
  font-weight: 200;
  line-height: 1.1;
  letter-spacing: -0.03em;
  white-space: nowrap;
`

export const Star = styled(StarIcon)`
  flex: none;
  width: clamp(16px, 1.8vw, 26px);
  height: auto;
  color: var(--petrol);
`
