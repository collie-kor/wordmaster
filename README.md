# WordMaster

워드마스터 수능 2000 기반 듀오링고 스타일 단어 암기 웹앱.
비밀번호로 접근을 제한하고, 시험 범위별로 단어를 랜덤 카드로 암기한다.
웹은 Vercel(서버리스 함수)로 배포하고, Capacitor로 안드로이드 APK를 만든다.

## 기술 스택
- React + Vite + TypeScript
- 순수 CSS (CSS 변수 디자인 토큰), Framer Motion
- 백엔드: Vercel 서버리스 함수 `api/words.js` (DB 없음)

## 보안 설계 (핵심)
- 비밀번호는 **클라이언트 코드/번들 어디에도 없다.** 서버 환경변수 `APP_PASSWORD`로만 검증.
- 단어 데이터 `words.json`은 **`api/` 폴더(서버 전용)** 에 둔다. `src/`·`public/`에 두지 않는다.
- 비번이 맞아야만 서버 함수가 단어를 내려준다. (`/api/words`, POST)

## 폴더 구조
```
api/words.js          # 서버리스 함수 (비번 검증 + 단어 반환, CORS)
api/words.json        # 단어 데이터 (서버 전용)
src/components/        # PasswordModal, ExamSelect, CardDeck, Flashcard
src/lib/              # api.ts(호출), storage.ts(캐시/테마/통과 플래그)
src/styles/tokens.css # 디자인 토큰 (라이트/다크, 포인트=짙은 청록)
src/App.tsx, main.tsx
capacitor.config.ts   # APK 래핑 설정
vercel.json
```

## 로컬 실행
서버리스 함수(`/api/words`)까지 함께 돌리려면 Vercel CLI가 필요하다.

```bash
npm install

# 1) 프런트만 (UI 확인용 — /api 호출은 실패)
npm run dev

# 2) 함수까지 포함 (권장)
npm i -g vercel
vercel dev          # 최초 실행 시 프로젝트 링크 질문에 답
```

`vercel dev` 사용 시 비밀번호 검증을 위해 환경변수가 필요하다.
프로젝트 루트에 `.env.local` 을 만들고:

```
APP_PASSWORD=bt_son
```

> `.env.example` 참고. 실제 값 파일(`.env*`)은 git에 커밋되지 않는다(.gitignore).

## 배포 (웹 / Vercel)
1. GitHub **개인 저장소**에 push (조직 저장소는 Hobby 미지원).
2. Vercel에서 해당 저장소 **Import** (프레임워크: Vite 자동 감지).
3. **Settings → Environment Variables** 에 `APP_PASSWORD = bt_son` 추가 (Production).
4. 배포 → `https://<앱>.vercel.app` 에서 동작 확인.

## APK 빌드 (Capacitor)
```bash
# 1) 배포된 Vercel URL을 클라이언트 API 주소로 지정
echo "VITE_API_BASE=https://<앱>.vercel.app" > .env.production

# 2) 웹 빌드
npm run build

# 3) Capacitor 추가
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init WordMaster com.wordmaster.app --web-dir dist   # 이미 capacitor.config.ts 있으면 생략 가능
npx cap add android
npx cap sync

# 4) 빌드
npx cap open android            # Android Studio: Build > Build APK(s)
# 또는 CLI:
cd android && ./gradlew assembleDebug
```
생성된 `android/app/build/outputs/apk/debug/app-debug.apk` 를 직접 전달한다.

## 비밀번호 노출 점검
- 빌드 산출물(`dist/`)에 `bt_son` 문자열이 없어야 한다:
  ```bash
  npm run build
  grep -r "bt_son" dist/ || echo "OK: 번들에 비밀번호 없음"
  ```
- 비밀번호는 오직 Vercel 환경변수와 서버 함수 안에서만 존재한다.
