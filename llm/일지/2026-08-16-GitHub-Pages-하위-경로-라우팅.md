# 2026-08-16 GitHub Pages 하위 경로 라우팅

## 문제

`https://phryxia.github.io/noema/`에서 헤더(내비게이터)는 뜨는데 본문은 Not Found였고,
"NOEMA System" 링크를 누르면 주소가 `https://phryxia.github.io/`로 튀어 새로고침 시 GitHub 404가 났다.

자산과 라우터가 서로 다른 기준 경로를 봤다.
`base: './'` 덕에 `./assets/...`는 `/noema/` 아래에서도 로드됐지만,
TanStack Router에 `basepath`가 없어 `location.pathname` 전체(`/noema/`)를 라우트로 매칭해 실패했고,
`<Link to="/">`는 `href="/"`를 만들어 사이트 루트로 벗어났다.
PWA 작업 때 자산 경로만 상대로 두고 라우터는 고려하지 않은 것이 원인.

## 해결

배포 경로를 빌드 시 한 곳에서 절대경로로 주입하고 라우터가 같은 값을 쓰게 했다.

- `vite.config.ts` `base: './'` → `'/'`. dev는 원래 `/`로 동작하고 있었으므로 개발 환경 변화 없음.
- `main.tsx` `createRouter({ routeTree, basepath: import.meta.env.BASE_URL })`. dev/일반 빌드는 `/`, gh-page는 `/noema/`.
- 루트 `build-gh-page`에 `--base=/noema/` 추가. 커스텀 도메인 루트로 옮길 때는 이 플래그만 `--base=/`로 바꾸면 된다.
- 워크플로에 `cp docs/index.html docs/404.html` 스텝 추가. base가 절대경로가 되어 그동안 미뤄둔 딥링크 새로고침 fallback을 넣을 수 있게 됐다.
- manifest의 `start_url`/`scope: './'`와 `navigateFallback: 'index.html'`은 각각 manifest URL·SW URL 기준으로 해석되므로 손대지 않았다.
  SW 등록 경로는 플러그인이 base로 만들어 `/noema/sw.js`(scope `/noema/`)가 됐다.
- 검증: docs를 `/noema/`에 마운트한 정적 서버 + playwright로 루트 진입 렌더, 홈 링크 클릭 후 URL `/noema/` 유지,
  `탐색` href `/noema/explore`, `/noema/explore` 직접 진입(404 fallback 경유) 렌더 확인. 일반 `build`는 `/assets/`로 종전과 동일.

