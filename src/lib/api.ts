export type Exam = 'midterm' | 'final'

export interface Word {
  word: string
  pos: string
  meaning: string
}

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export class AuthError extends Error {}

/**
 * 비밀번호와 시험 범위를 서버로 보내 검증 후 단어 목록을 받는다.
 * - 401: AuthError (비밀번호 오류)
 * - 그 외 실패: 일반 Error
 */
export async function fetchWords(password: string, exam: Exam): Promise<Word[]> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, exam }),
    })
  } catch {
    throw new Error('네트워크 오류로 단어를 불러오지 못했습니다.')
  }

  if (res.status === 401) {
    throw new AuthError('unauthorized')
  }
  if (!res.ok) {
    throw new Error('단어를 불러오지 못했습니다.')
  }

  const data = (await res.json()) as { words: Word[] }
  return data.words
}
