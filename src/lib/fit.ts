import { useLayoutEffect, useRef } from 'react'

/**
 * 영어 단어를 항상 한 줄에 두고, 카드 폭을 넘치면 폰트를 줄여 맞춘다.
 * 반환한 ref를 글자 span에 달면, 그 부모(폭 기준 박스)에 맞춰 자동 축소된다.
 */
export function useFitText(text: string) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return

    const SAFETY = 4

    const fit = () => {
      el.style.fontSize = ''
      let size = parseFloat(getComputedStyle(el).fontSize)
      let guard = 300
      while (el.scrollWidth > box.clientWidth - SAFETY && size > 12 && guard-- > 0) {
        size -= 1
        el.style.fontSize = `${size}px`
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    document.fonts?.ready.then(fit).catch(() => {})

    return () => ro.disconnect()
  }, [text])

  return ref
}

/**
 * 한글 뜻이 정해진 영역(box)을 넘으면(높이·폭) 글자 크기를 줄여 영역 안에 맞춘다.
 * boxRef = 경계가 있는 컨테이너, textRef = 줄어들 텍스트.
 */
export function useFitMeaning(text: string) {
  const boxRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const box = boxRef.current
    const t = textRef.current
    if (!box || !t) return

    const fit = () => {
      t.style.fontSize = ''
      let size = parseFloat(getComputedStyle(t).fontSize)
      let guard = 200
      while (
        (box.scrollHeight > box.clientHeight || box.scrollWidth > box.clientWidth) &&
        size > 11 &&
        guard-- > 0
      ) {
        size -= 1
        t.style.fontSize = `${size}px`
      }
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    document.fonts?.ready.then(fit).catch(() => {})

    return () => ro.disconnect()
  }, [text])

  return { boxRef, textRef }
}
