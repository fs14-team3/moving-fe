# moving-fe

무빙(이사 소비자와 기사님 견적 매칭 서비스)의 프론트엔드입니다.

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · ESLint · Prettier · Husky · lint-staged · commitlint · gitleaks · Vercel

## 시작하기

요구 사항: Node.js 24 (`.nvmrc`), npm 11+, [gitleaks](https://github.com/gitleaks/gitleaks)

```bash
nvm use                # nvm-windows는 .nvmrc를 읽지 않으므로 `nvm install 24` 후 `nvm use 24`
npm ci                 # package-lock.json 그대로 설치 (CI와 동일)
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

패키지를 추가할 때만 `npm install <패키지>`를 사용합니다. `package-lock.json`이 바뀐 브랜치를 받으면 `npm ci`를 다시 실행합니다.

API를 호출하려면 [moving-be](https://github.com/fs14-team3/moving-be)를 함께 실행합니다. (기본 포트 4000)

gitleaks 설치: macOS `brew install gitleaks`, Windows `winget install Gitleaks.Gitleaks` (또는 `scoop install gitleaks`)

## 환경 변수

| 이름                       | 예시                        | 설명                                             |
| -------------------------- | --------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`      | `http://localhost:4000/api` | API 주소. 브라우저에 노출되므로 비밀값 금지      |
| `NEXT_PUBLIC_SENTRY_DSN`   |                             | Sentry 오류 수집을 위한 DSN                      |
| `SENTRY_AUTH_TOKEN`        |                             | Sentry 소스맵 업로드용 인증 토큰. 외부 노출 금지 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` |                             | 카카오톡 공유를 위한 JavaScript SDK 키           |

## 명령어

| 명령어                 | 설명                                     |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | 개발 서버                                |
| `npm run build`        | 프로덕션 빌드 (타입 검사 포함)           |
| `npm run lint`         | ESLint 검사 (`lint:fix`로 자동 수정)     |
| `npm run typecheck`    | 빌드 없이 타입만 검사                    |
| `npm run knip`         | 사용하지 않는 파일·export·의존성 검사    |
| `npm run format:check` | Prettier 검사 (`format`으로 수정)        |
| `npm run test`         | Vitest 실행 (`test:watch`로 감시)        |
| `npm run api:types`    | moving-be `develop` 명세로 API 타입 생성 |

백엔드 명세가 바뀌면 `API types` 워크플로가 `src/lib/api-schema.d.ts`를 갱신하는 PR을 엽니다. 그 PR에서 빌드가 깨지면 같은 브랜치에서 코드를 고친 뒤 머지합니다.

커밋 시 Husky가 gitleaks(비밀값 검사), lint-staged(ESLint + Prettier), commitlint를 실행합니다. gitleaks가 설치되어 있지 않으면 로컬 검사만 건너뛰고, CI가 PR과 push에 포함된 커밋을 다시 검사합니다.

## 비밀값 검사 (gitleaks)

- 커밋이 막히면 출력의 `File`과 `Line`을 확인하고, 비밀값을 `.env.local`로 옮깁니다.
- 오탐이면 출력의 `Fingerprint` 값을 `.gitleaksignore`에 한 줄로 추가합니다.
- 이미 push된 비밀값은 커밋을 지워도 노출된 것으로 보고 키를 재발급합니다.

## Windows 참고

- **줄바꿈**: 모든 파일은 LF입니다. `.gitattributes`가 Git의 `core.autocrlf` 설정과 관계없이 LF로 체크아웃하고, `.editorconfig`와 `.vscode/settings.json`이 새 파일도 LF로 만듭니다. 그래도 Prettier가 여러 파일을 한꺼번에 경고하면 `npm run format`을 실행합니다.
- **파일 이름 대소문자**: `button.tsx` → `Button.tsx`처럼 대소문자만 바꿀 때는 `git mv`를 사용합니다. Windows와 macOS는 대소문자를 구분하지 않아 Git이 변경을 놓치고, Linux인 Vercel과 CI에서만 빌드가 깨집니다.

## API 명세

- [openapi.yaml](https://github.com/fs14-team3/moving-be/blob/develop/docs/api/openapi.yaml) (moving-be 저장소)
- Swagger UI: 배포 후 추가

## 협업 규칙

브랜치 전략, 커밋 형식, PR 규칙은 [CONTRIBUTING.md](https://github.com/fs14-team3/.github/blob/main/CONTRIBUTING.md)를 따릅니다.
