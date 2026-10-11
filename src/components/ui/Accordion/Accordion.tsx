import { useId, useState } from 'react'
import styled from 'styled-components'
import { collapsible } from '@/styles/mixins'
import { Plus } from '../Icons'

const List = styled.div`
  border-top: 1px solid var(--line);
`

const Item = styled.div`
  border-bottom: 1px solid var(--line);
`

const Question = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  min-height: 64px;
  padding: 18px 0;
  text-align: left;
  font-size: clamp(1rem, 1.3vw, 1.125rem);
  font-weight: 650;
  letter-spacing: -0.01em;
`

const Icon = styled.span<{ $open: boolean }>`
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ $open }) => ($open ? 'var(--ink)' : 'var(--line-strong)')};
  background: ${({ $open }) => ($open ? 'var(--ink)' : 'transparent')};
  color: ${({ $open }) => ($open ? 'var(--white)' : 'var(--ink)')};
  transition: all 0.4s var(--ease);

  svg {
    width: 18px;
    height: 18px;
    transform: rotate(${({ $open }) => ($open ? '45deg' : '0')});
    transition: transform 0.4s var(--ease);
  }
`

const Answer = styled.div<{ $open: boolean }>`
  ${({ $open }) => collapsible($open)}
  transition: grid-template-rows 0.45s var(--ease);

  p {
    max-width: 68ch;
    padding: 0 56px 22px 0;
    color: var(--muted);
  }
`

export type AccordionItem = { q: string; a: string }

/** Lista de perguntas e respostas; uma aberta por vez. */
export function Accordion({ items, defaultOpen = 0 }: { items: AccordionItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <List>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <Item key={item.q}>
            <h3>
              <Question
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <Icon $open={isOpen} aria-hidden="true">
                  <Plus />
                </Icon>
              </Question>
            </h3>
            <Answer id={`${id}-a${i}`} $open={isOpen} role="region" aria-labelledby={`${id}-q${i}`} inert={!isOpen}>
              <div>
                <p>{item.a}</p>
              </div>
            </Answer>
          </Item>
        )
      })}
    </List>
  )
}
