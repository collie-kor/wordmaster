import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Word } from '../lib/api'
import Flashcard from './Flashcard'
import './CardDeck.css'

interface Props {
  words: Word[]
  title: string
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function CardDeck({ words, title, onBack }: Props) {
  const [order, setOrder] = useState<Word[]>(() => shuffle(words))
  const [index, setIndex] = useState(0)

  const total = order.length
  const done = index >= total
  const progress = useMemo(
    () => (total ? Math.min(index, total) / total : 0),
    [index, total]
  )

  function advance() {
    setIndex((i) => i + 1)
  }

  function restart() {
    setOrder(shuffle(words))
    setIndex(0)
  }

  // 맨 앞 카드 포함 최대 3장만 렌더(겹친 더미 효과)
  const visible = order
    .map((w, i) => ({ w, i }))
    .slice(index, index + 3)

  return (
    <div className="cd-wrap">
      <header className="cd-head">
        <button className="cd-back" onClick={onBack} aria-label="뒤로">
          ← 모드 선택
        </button>
        <span className="cd-progress-text">
          {Math.min(index, total)} / {total}
        </span>
      </header>

      <div className="cd-bar">
        <motion.div
          className="cd-bar-fill"
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
        />
      </div>

      <div className="cd-stage">
        {done ? (
          <motion.div
            className="cd-done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="cd-done-title">완료!</span>
            <span className="cd-done-sub">{title} · {total}단어</span>
            <button className="cd-restart" onClick={restart}>
              다시 시작 (재셔플)
            </button>
          </motion.div>
        ) : (
          visible
            .slice()
            .reverse()
            .map(({ w, i }) => (
              <Flashcard
                key={i}
                word={w}
                depth={i - index}
                onNext={advance}
              />
            ))
        )}
      </div>

      {!done && (
        <div className="cd-controls">
          <button className="cd-next" onClick={advance}>
            다음
          </button>
        </div>
      )}
    </div>
  )
}
