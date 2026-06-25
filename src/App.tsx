import { useEffect, useState } from 'react'
import PasswordModal from './components/PasswordModal'
import ExamSelect, { EXAMS } from './components/ExamSelect'
import CardDeck from './components/CardDeck'
import { fetchWords, type Exam, type Word } from './lib/api'
import { passStore, wordCache, themeStore, type Theme } from './lib/storage'
import './App.css'

type View = 'select' | 'deck'

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => themeStore.get())
  const [passed, setPassed] = useState(() => passStore.isPassed())
  const [view, setView] = useState<View>('select')
  const [exam, setExam] = useState<Exam | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    themeStore.set(theme)
  }, [theme])

  async function selectExam(picked: Exam) {
    setExam(picked)
    setLoadError('')

    // 오프라인 대비: 캐시가 있으면 먼저 사용
    const cached = wordCache.get(picked)
    if (cached?.length) {
      setWords(cached)
      setView('deck')
      return
    }

    setLoading(true)
    try {
      // 로그인 시 전 시험을 캐시하므로 보통 여기 오지 않는다.
      // (캐시가 비워진 경우만) 평문 보관을 피하려 비번을 다시 받는다.
      const pwd = window.prompt('비밀번호를 다시 입력하세요 (단어 불러오기)')
      if (!pwd) {
        setLoading(false)
        return
      }
      const w = await fetchWords(pwd, picked)
      wordCache.set(picked, w)
      setWords(w)
      setView('deck')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }

  function backToSelect() {
    setView('select')
    setExam(null)
    setWords([])
  }

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  if (!passed) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <PasswordModal onPass={() => setPassed(true)} />
      </>
    )
  }

  const examTitle = EXAMS.find((e) => e.exam === exam)?.title ?? ''

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {view === 'select' && (
        <>
          <ExamSelect onSelect={selectExam} />
          {loading && <p className="app-status">불러오는 중…</p>}
          {loadError && <p className="app-status app-status-error">{loadError}</p>}
        </>
      )}

      {view === 'deck' && exam && (
        <CardDeck words={words} title={examTitle} onBack={backToSelect} />
      )}
    </div>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="테마 전환"
      title="라이트/다크 전환"
    >
      {theme === 'light' ? '◐' : '◑'}
    </button>
  )
}
