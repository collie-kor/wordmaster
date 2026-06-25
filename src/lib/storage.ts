import type { Exam, Word } from './api'

const PASS_KEY = 'wm.pass'
const THEME_KEY = 'wm.theme'
// v2: 단어에 day 필드 추가 → 이전 캐시(day 없음)는 무시되도록 키 버전 올림
const wordsKey = (exam: Exam) => `wm.words.v2.${exam}`

export type Theme = 'light' | 'dark'

export const passStore = {
  isPassed: () => localStorage.getItem(PASS_KEY) === '1',
  setPassed: () => localStorage.setItem(PASS_KEY, '1'),
  clear: () => localStorage.removeItem(PASS_KEY),
}

export const wordCache = {
  get(exam: Exam): Word[] | null {
    try {
      const raw = localStorage.getItem(wordsKey(exam))
      return raw ? (JSON.parse(raw) as Word[]) : null
    } catch {
      return null
    }
  },
  set(exam: Exam, words: Word[]) {
    try {
      localStorage.setItem(wordsKey(exam), JSON.stringify(words))
    } catch {
      /* 용량 초과 등은 무시 — 캐시는 부가기능 */
    }
  },
}

export const themeStore = {
  get(): Theme {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    // 저장된 선택이 없으면 시스템 설정과 무관하게 기본 라이트모드
    return 'light'
  },
  set(theme: Theme) {
    localStorage.setItem(THEME_KEY, theme)
  },
}
