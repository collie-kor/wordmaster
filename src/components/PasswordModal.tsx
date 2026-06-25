import { useState } from 'react'
import { motion } from 'framer-motion'
import { fetchWords, AuthError } from '../lib/api'
import { EXAMS } from './ExamSelect'
import { passStore, wordCache } from '../lib/storage'
import './PasswordModal.css'

interface Props {
  onPass: () => void
}

/**
 * 첫 진입 비밀번호 모달.
 * 비번 검증을 위해 실제 /api/words 를 호출하고, 성공 시 모든 시험 단어를 캐시해 둔다.
 * → 비번이 맞아야만 서버가 단어를 주는 구조라 별도 검증 엔드포인트가 필요 없다.
 * → 로그인 한 번으로 전 시험을 캐시하므로 이후 오프라인/재실행에도 비번 재입력이 없다.
 */
export default function PasswordModal({ onPass }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(0)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || !value) return
    setLoading(true)
    setError('')
    try {
      // 첫 시험으로 비번을 검증하고, 통과 시 나머지 시험도 받아 모두 캐시.
      const [first, ...rest] = EXAMS
      const firstWords = await fetchWords(value, first.exam)
      wordCache.set(first.exam, firstWords)
      await Promise.all(
        rest.map(async (e) => {
          wordCache.set(e.exam, await fetchWords(value, e.exam))
        })
      )
      passStore.setPassed()
      onPass()
    } catch (err) {
      if (err instanceof AuthError) {
        setError('비밀번호가 올바르지 않습니다')
      } else {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다')
      }
      setShake((s) => s + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pm-overlay">
      <motion.form
        className="pm-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="pm-title">WordMaster</h1>
        <p className="pm-sub">비밀번호를 입력하세요</p>

        <motion.div
          key={shake}
          animate={shake ? { x: [0, -8, 8, -6, 6, -3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            className="pm-input"
            type="password"
            inputMode="text"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError('')
            }}
            placeholder="••••••"
            aria-label="비밀번호"
          />
        </motion.div>

        {error && <p className="pm-error">{error}</p>}

        <button className="pm-submit" type="submit" disabled={loading || !value}>
          {loading ? '확인 중…' : '입력'}
        </button>
      </motion.form>
    </div>
  )
}
