import { useLayoutEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import type { Word } from '../lib/api'
import './Flashcard.css'

/**
 * 단어를 항상 한 줄에 두고, 카드 폭을 넘치면 폰트를 줄여 맞춘다.
 * (CSS clamp만으로는 14글자급 긴 단어를 좁은 화면에서 한 줄로 보장하기 어렵다.)
 */
function useFitText(text: string) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return

    const SAFETY = 4 // 잘림 방지용 여백(px)

    const fit = () => {
      el.style.fontSize = '' // CSS 기본(최대) 크기로 리셋 후 측정
      let size = parseFloat(getComputedStyle(el).fontSize)
      let guard = 300
      // 한 줄(nowrap) 상태에서 폭을 넘으면 한 단계씩 축소(여백 포함)
      while (el.scrollWidth > box.clientWidth - SAFETY && size > 12 && guard-- > 0) {
        size -= 1
        el.style.fontSize = `${size}px`
      }
    }

    fit()
    // 카드 크기가 최종 확정되거나 바뀔 때마다(레이아웃 settle, 회전, 리사이즈)
    // 다시 맞춘다. 초기 측정이 카드의 임시(넓은) 크기로 잡혀도 교정됨.
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    document.fonts?.ready.then(fit).catch(() => {})

    return () => ro.disconnect()
  }, [text])

  return ref
}

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
