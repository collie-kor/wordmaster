import { motion } from 'framer-motion'
import './DaySelect.css'

interface Props {
  title: string
  subtitle: string
  days: number[]
  onSelect: (day: number) => void
  onBack: () => void
}

export default function DaySelect({ title, subtitle, days, onSelect, onBack }: Props) {
  return (
    <div className="dy-wrap">
      <button className="dy-back" onClick={onBack}>
        ← 모드 선택
      </button>
      <header className="dy-head">
        <h1 className="dy-title">{title}</h1>
        <p className="dy-sub">{subtitle}</p>
      </header>

      <motion.div
        className="dy-grid"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {days.map((d) => (
          <button key={d} className="dy-day" onClick={() => onSelect(d)}>
            DAY {d}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
