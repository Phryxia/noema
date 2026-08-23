# 2026-07-25 WordWriter 존재 확인 전 저장 차단

## 문제

`isExisting`이 100ms 스로틀된 값과 비동기 쿼리 결과에 의존해서, 단어를 치고 곧바로 Enter를 누르면
존재 확인이 끝나기 전에 `saveWord`가 실행됐다. `createWord`는 기존 단어면 no-op이라 데이터는 안전하지만,
입력창이 비워지는 게 신규 저장과 똑같아 "이미 있던 단어"임을 알 수 없었다.

## 해결

`isChecking = throttledValue !== value || isFetching`을 두고, 제출 가드와 저장 버튼 `disabled`에 추가했다.
스로틀이 아직 안 따라온 창과 쿼리 fetching 중인 창 모두에서 저장이 잠긴다.
`isExisting`은 `!isChecking && typeof existingNodeId === 'number'`로 바꿔 확인이 끝난 뒤에만 참이 된다.

