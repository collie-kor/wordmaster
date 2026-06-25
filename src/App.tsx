import { useEffect, useMemo, useState } from 'react'
import PasswordModal from './components/PasswordModal'
import ExamSelect, { EXAMS } from './components/ExamSelect'
import ModeSelect, { type Mode } from './components/ModeSelect'
import DaySelect from './components/DaySelect'
import StudyDeck from './components/StudyDeck'
import TestDeck from './components/TestDeck'
import CardDeck from './components/CardDeck'
import { fetchWords, type Exam, type Word } from './lib/api'
import { passStore, wordCache, themeStore, type Theme } from './lib/storage'
import './App.css'

type Screen = 'examSelect' | 'modeSelect' | 'daySelect' | 'study' | 'test' | 'random'

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => themeStore.get())
  const [passed, setPassed] = useState(() => passStore.isPassed())

  const [screen, setScreen] = useState<Screen>('examSelect')
  const [exam, setExam] = useState<Exam | null>(null)
  const [words, setWords] = useState<Word[]>([]) // 선택 시험의 전체 단어(단어장 순서)
  const [mode, setMode] = useState<Mode | null>(null)
  const [day, setDay] = useState<number | null>(null)

  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    themeStore.set(theme)
  }, [theme])

  const examTitle = useMemo(
    () => EXAMS.find((e) => e.exam === exam)?.title ?? '',
    [exam]
  )
  const days = useMemo(
    () => [...new Set(words.map((w) => w.day))].sort((a, b) => a - b),
    [words]
  )
  const dayWords = useMemo(
    () => (day == null ? [] : words.filter((w) => w.day === day)),
    [words, day]
  )

  async function selectExam(picked: Exam) {
    setExam(picked)
    setLoadError('')

    const cached = wordCache.get(picked)
    if (cached?.length) {
      setWords(cached)
      setScreen('modeSelect')
      return
    }

    setLoading(true)
    try {
      const pwd = window.prompt('비밀번호를 다시 입력하세요 (단어 불러오기)')
      if (!pwd) {
        setLoading(false)
        return
      }
      const w = await fetchWords(pwd, picked)
      wordCache.set(picked, w)
      setWords(w)
      setScreen('modeSelect')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }

  function selectMode(m: Mode) {
    setMode(m)
    if (m === 'random') setScreen('random')
    else setScreen('daySelect')
  }

  function selectDay(d: number) {
    setDay(d)
    setScreen(mode === 'study' ? 'study' : 'test')
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

  const dayTitle = day != null ? `${examTitle} · DAY ${day}` : examTitle

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {screen === 'examSelect' && (
        <>
          <ExamSelect onSelect={selectExam} />
          {loading && <p className="app-status">불러오는 중…</p>}
          {loadError && <p className="app-status app-status-error">{loadError}</p>}
        </>
      )}

      {screen === 'modeSelect' && exam && (
        <ModeSelect
          title={examTitle}
          onSelect={selectMode}
          onBack={() => setScreen('examSelect')}
        />
      )}

      {screen === 'daySelect' && (
        <DaySelect
          title={examTitle}
          subtitle={mode === 'study' ? 'DAY별 학습' : 'DAY별 테스트'}
          days={days}
          onSelect={selectDay}
          onBack={() => setScreen('modeSelect')}
        />
      )}

      {screen === 'study' && (
        <StudyDeck
          words={dayWords}
          title={dayTitle}
          onBack={() => setScreen('daySelect')}
        />
      )}

      {screen === 'test' && (
        <TestDeck
          dayWords={dayWords}
          pool={words}
          title={dayTitle}
          onBack={() => setScreen('daySelect')}
        />
      )}

      {screen === 'random' && (
        <CardDeck
          words={words}
          title={examTitle}
          onBack={() => setScreen('modeSelect')}
        />
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
