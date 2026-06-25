// Vercel 서버리스 함수 — 비밀번호 검증 후 해당 시험 단어만 반환.
// 비밀번호는 절대 코드에 두지 않고 환경변수 APP_PASSWORD 로만 검증한다.
// 단어 데이터(words.json)는 이 /api 폴더 안에 있어 클라이언트 번들에 노출되지 않는다.

import allWords from './words.json' with { type: 'json' }

const VALID_EXAMS = new Set(['midterm', 'final'])

export default function handler(req, res) {
  // CORS — APK는 다른 출처(예: capacitor://localhost)에서 호출하므로 허용.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  // Vercel은 보통 req.body를 파싱해주지만, 안전하게 직접 파싱도 처리.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  const { password, exam } = body || {}

  if (!process.env.APP_PASSWORD) {
    res.status(500).json({ error: 'server_misconfigured' })
    return
  }

  if (password !== process.env.APP_PASSWORD) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  if (!VALID_EXAMS.has(exam)) {
    res.status(400).json({ error: 'invalid_exam' })
    return
  }

  const words = allWords
    .filter((w) => w.exam === exam)
    .map(({ word, pos, meaning }) => ({ word, pos, meaning }))

  res.status(200).json({ words })
}
