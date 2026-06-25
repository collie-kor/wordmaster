import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Word } from '../lib/api'
import './Flashcard.css'

interface Props {
  word: Word
  /** 카드 깊이(겹친 카드 표현용). 0 = 맨 앞 */
  depth: number
  onNext: (direction: 1 | -1) => void
}

const PEEK_DISTANCE = 120 // 이 거리만큼 위로 끌면 뜻이 완전히 드러남
const SWIPE_THRESHOLD = 90 // 좌우로 이 이상 끌면 다음 카드

export default function Flashcard({ word, depth, onNext }: Props) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // 위로 끈 거리(-y)에 비례해 뜻이 서서히 드러남
  const meaningOpacity = useTransform(y, [-PEEK_DISTANCE, -10, 0], [1, 0.05, 0])
  const meaningTranslate = useTransform(y, [-PEEK_DISTANCE, 0], [0, 10])
  const wordOpacity = useTransform(y, [-PEEK_DISTANCE, 0], [0.25, 1])
  const hintOpacity = useTransform(y, [-40, 0], [0, 0.9])

  const isFront = depth === 0

  function handleDragEnd(_: unknown, info: PanInfo) {
    const dx = info.offset.x
    const horizontal = Math.abs(dx) > Math.abs(info.offset.y)

    if (horizontal && Math.abs(dx) > SWIPE_THRESHOLD) {
      const direction: 1 | -1 = dx < 0 ? 1 : -1
      // 카드를 화면 밖으로 날린 뒤 다음 카드로
      animate(x, direction === 1 ? -600 : 600, {
        duration: 0.25,
        ease: 'easeIn',
        onComplete: () => onNext(direction),
      })
      return
    }

    // 그 외(위로 peek 포함)는 원위치로 스프링백
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 32 })
    animate(y, 0, { type: 'spring', stiffness: 500, damping: 32 })
  }

  return (
    <motion.div
      className="fc-card"
      style={{
        x,
        y,
        zIndex: 10 - depth,
        scale: 1 - depth * 0.04,
        translateY: depth * 14,
        pointerEvents: isFront ? 'auto' : 'none',
      }}
      drag={isFront}
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span className="fc-word" style={{ opacity: isFront ? wordOpacity : 1 }}>
        {word.word}
      </motion.span>

      <motion.div
        className="fc-meaning"
        style={{
          opacity: isFront ? meaningOpacity : 0,
          y: isFront ? meaningTranslate : 0,
        }}
      >
        <span className="fc-pos">{word.pos}</span>
        <span className="fc-meaning-text">{word.meaning}</span>
      </motion.div>

      {isFront && (
        <motion.span className="fc-hint" style={{ opacity: hintOpacity }}>
          ↑ 위로 끌어 뜻 보기
        </motion.span>
      )}
    </motion.div>
  )
}
