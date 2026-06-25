import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Word } from '../lib/api'
import { useFitText } from '../lib/fit'
import './CardDeck.css'
import './StudyDeck.css'
import './TestDeck.css'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Question {
  word: Word
  options: string[]
  answer: string
}

function buildQuestions(dayWords: Word[], pool: Word[]): Question[] {
  const allMeanings = [...new Set(pool.map((w) => w.meaning))]
  return shuffle(dayWords).map((w) => {
    const distractors = shuffle(allMeanings.filter((m) => m !== w.meaning)).slice(0, 3)
    return { word: w, options: shuffle([w.meaning, ...distractors]), answer: w.meaning }
  })
}

interface Props {
  dayWords: Word[] // 해당 DAY 단어
  pool: Word[] // 보기(오답) 출제용 — 같은 시험 전체 단어
  title: string
  onBack: () => void
}

export default function TestDeck({ dayWords, pool, title, onBack }: Props) {
  const [qs, setQs] = useState<Question[]>(() => buildQuestions(dayWords, pool))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [wrong, setWrong] = useState<Word[]>([])

  const total = qs.length
  const done = index >= total
  const q = qs[index]
  const wordRef = useFitText(q?.word.word ?? '')
  const progress = total ? index / total : 0

  function pick(opt: string) {
    if (picked) return // 이미 선택함
    setPicked(opt)
    if (opt !== q.answer) setWrong((w) => [...w, q.word])
  }

  function next() {
    setPicked(null)
    setIndex((i) => i + 1)
  }

  function restart() {
    setQs(buildQuestions(dayWords, pool))
    setIndex(0)
    setPicked(null)
    setWrong([])
  }

  if (done) {
    const correct = total - wrong.length
    return (
      <div className="cd-wrap">
        <header className="cd-head">
          <button className="cd-back" onClick={onBack}>
            ← DAY 선택
          </button>
          <span className="cd-progress-text">결과</span>
        </header>

        <motion.div
          className="tq-result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="tq-score">
            {correct} / {total}
          </span>
          <span className="tq-score-sub">
            {wrong.length === 0 ? '전부 맞았어요! 🎉' : `${wrong.length}개 틀림`}
          </span>

          {wrong.length > 0 && (
            <div className="tq-wronglist">
              <div className="tq-wronglist-head">틀린 단어</div>
              <ul>
                {wrong.map((w, i) => (
                  <li key={i}>
                    <span className="tq-wrong-word">{w.word}</span>
                    <span className="tq-wrong-meaning">
                      {w.pos} {w.meaning}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="tq-result-actions">
            <button className="study-btn study-prev" onClick={onBack}>
              DAY 선택
            </button>
            <button className="study-btn study-next" onClick={restart}>
              다시 풀기
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="cd-wrap">
      <header className="cd-head">
        <button className="cd-back" onClick={onBack}>
          ← DAY 선택
        </button>
        <span className="cd-progress-text">
          {index + 1} / {total}
        </span>
      </header>

      <div className="cd-bar">
        <motion.div
          className="cd-bar-fill"
          animate={{ width: `${progress * 100}%` }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
        />
      </div>

      <div className="tq-body">
        <div className="tq-prompt">
          <span className="tq-prompt-label">{title}</span>
          <div className="tq-word-box">
            <span ref={wordRef} className="tq-word">
              {q.word.word}
            </span>
          </div>
        </div>

        <div className="tq-options">
          {q.options.map((opt) => {
            let cls = 'tq-option'
            if (picked) {
              if (opt === q.answer) cls += ' tq-correct'
              else if (opt === picked) cls += ' tq-wrong'
              else cls += ' tq-dim'
            }
            return (
              <button key={opt} className={cls} onClick={() => pick(opt)} disabled={!!picked}>
                {opt}
              </button>
            )
          })}
        </div>

        <div className="tq-foot">
          {picked && (
            <button className="study-btn study-next tq-nextbtn" onClick={next}>
              {index === total - 1 ? '결과 보기' : '다음'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
