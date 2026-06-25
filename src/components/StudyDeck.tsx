import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Word } from '../lib/api'
import { useFitText, useFitMeaning } from '../lib/fit'
import './Flashcard.css'
import './CardDeck.css'
import './StudyDeck.css'

/** 학습용 카드 — 영단어와 뜻을 처음부터 둘 다 보여준다(드래그/peek 없음). */
function StudyCard({ word }: { word: Word }) {
  const wordRef = useFitText(word.word)
  const { boxRef, textRef } = useFitMeaning(word.meaning)
  return (
    <div className="fc-card study-card">
      <div className="fc-word-box">
        <span ref={wordRef} className="fc-word">
          {word.word}
        </span>
      </div>
      <div ref={boxRef} className="fc-meaning">
        <span className="fc-pos">{word.pos}</span>
        <span ref={textRef} className="fc-meaning-text">
          {word.meaning}
        </span>
      </div>
    </div>
  )
}

interface Props {
  words: Word[] // 단어장 순서 그대로(셔플 X)
  title: string
  onBack: () => void
}

export default function StudyDeck({ words, title, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const total = words.length
  const done = index >= total
  const progress = total ? Math.min(index + (done ? 0 : 1), total) / total : 0

  return (
    <div className="cd-wrap">
      <header className="cd-head">
        <button className="cd-back" onClick={onBack}>
          ← DAY 선택
        </button>
        <span className="cd-progress-text">
          {Math.min(index + 1, total)} / {total}
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
            <span className="cd-done-title">학습 완료!</span>
            <span className="cd-done-sub">{title} · {total}단어</span>
            <button className="cd-restart" onClick={() => setIndex(0)}>
              처음부터 다시
            </button>
          </motion.div>
        ) : (
          <StudyCard key={index} word={words[index]} />
        )}
      </div>

      {!done && (
        <div className="cd-controls study-controls">
          <button
            className="study-btn study-prev"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            이전
          </button>
          <button
            className="study-btn study-next"
            onClick={() => setIndex((i) => i + 1)}
          >
            {index === total - 1 ? '완료' : '다음'}
          </button>
        </div>
      )}
    </div>
  )
}
