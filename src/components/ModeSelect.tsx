import { motion } from 'framer-motion'
import './ModeSelect.css'

export type Mode = 'study' | 'test' | 'random'

const MODES: { mode: Mode; title: string; desc: string }[] = [
  { mode: 'study', title: 'DAY별 학습', desc: '단어장 순서대로 영단어·뜻을 보며 외우기' },
  { mode: 'test', title: 'DAY별 테스트', desc: 'DAY별 4지선다 시험 — 끝에 틀린 단어 확인' },
  { mode: 'random', title: '전체 무작위 암기', desc: '시험 전범위 단어를 랜덤 카드로' },
]

interface Props {
  title: string
  onSelect: (mode: Mode) => void
  onBack: () => void
}

export default function ModeSelect({ title, onSelect, onBack }: Props) {
  return (
    <div className="ms-wrap">
      <button className="ms-back" onClick={onBack}>
        ← 시험 선택
      </button>
      <header className="ms-head">
        <h1 className="ms-title">{title}</h1>
        <p className="ms-sub">학습 방식을 고르세요</p>
      </header>

      <ul className="ms-list">
        {MODES.map((m, i) => (
          <motion.li
            key={m.mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="ms-card" onClick={() => onSelect(m.mode)}>
              <span className="ms-card-title">{m.title}</span>
              <span className="ms-card-desc">{m.desc}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
