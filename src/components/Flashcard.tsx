import { useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Word } from '../lib/api'
import { useFitText, useFitMeaning } from '../lib/fit'
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
  const wordRef = useFitText(word.word)
  const { boxRef: meaningBoxRef, textRef: meaningTextRef } = useFitMeaning(word.meaning)
  // 드래그(peek/스와이프) 직후 발생하는 click을 무시하기 위한 플래그
  const draggedRef = useRef(false)

  function handleDragStart() {
    draggedRef.current = true
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    // 이번 클릭 한 번만 무시(드래그 직후), 그 다음부터는 탭 허용
    setTimeout(() => {
      draggedRef.current = false
    }, 0)

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

  function handleClick() {
    // 큰 카드 아무 곳이나 탭하면 다음으로(죽은 탭 방지). 드래그 직후엔 무시.
    if (!isFront || draggedRef.current) return
    onNext(1)
  }

  return (
    <motion.div
      className="fc-card"
      style={{
        x,
        y,
        zIndex: 10 - depth,
        scale: 1 - depth * 0.04,
        // 겹친 카드는 위쪽으로 살짝 올려 표시(아래로 내리면 '다음' 버튼을 침범).
        translateY: depth * -8,
        pointerEvents: isFront ? 'auto' : 'none',
      }}
      drag={isFront}
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // 카드를 탭하면(드래그 아님) 다음으로 — 큰 카드에 탭이 떨어져도 넘어가게.
      // (위로 드래그=뜻 보기, 스와이프=다음 은 드래그라 click 가드로 제외)
      onClick={handleClick}
    >
      <div className="fc-word-box">
        <motion.span
          ref={wordRef}
          className="fc-word"
          style={{ opacity: isFront ? wordOpacity : 1 }}
        >
          {word.word}
        </motion.span>
      </div>

      <motion.div
        ref={meaningBoxRef}
        className="fc-meaning"
        style={{
          opacity: isFront ? meaningOpacity : 0,
          y: isFront ? meaningTranslate : 0,
        }}
      >
        <span className="fc-pos">{word.pos}</span>
        <span ref={meaningTextRef} className="fc-meaning-text">
          {word.meaning}
        </span>
      </motion.div>

      {isFront && (
        <motion.span className="fc-hint" style={{ opacity: hintOpacity }}>
          ↑ 위로 끌어 뜻 보기
        </motion.span>
      )}
    </motion.div>
  )
}
