import { motion } from 'framer-motion'
import type { Exam } from '../lib/api'
import './ExamSelect.css'

export interface ExamDef {
  exam: Exam
  title: string
  range: string
}

// 새 시험 추가는 여기에 항목 하나만 더하면 된다(하드코딩 나열 금지).
export const EXAMS: ExamDef[] = [
  { exam: 'midterm', title: '1학년 1학기 중간고사', range: 'DAY 1 – 12' },
  { exam: 'final', title: '1학년 1학기 기말고사', range: 'DAY 13 – 24' },
]

interface Props {
  onSelect: (exam: Exam) => void
}

export default function ExamSelect({ onSelect }: Props) {
  return (
    <div className="es-wrap">
      <header className="es-head">
        <h1 className="es-title">시험 선택</h1>
        <p className="es-sub">암기할 범위를 고르세요</p>
      </header>

      <ul className="es-list">
        {EXAMS.map((e, i) => (
          <motion.li
            key={e.exam}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="es-card" onClick={() => onSelect(e.exam)}>
              <span className="es-card-title">{e.title}</span>
              <span className="es-card-range">{e.range}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
