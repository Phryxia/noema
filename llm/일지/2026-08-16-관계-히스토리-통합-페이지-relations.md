# 2026-08-16 관계 히스토리 통합 페이지 `/relations`

## 문제

단어 관계 목록(`/relations/w2w`)과 문서-문장 관계 목록(`/relations/d2s`)이 열 구성이 달라 별도 페이지였고, 헤더에 `관계`/`문서 관계` 두 링크가 있었다.
하나의 표에 모든 유형을 시간순으로 섞어 보이려면 유형마다 다른 열(문제/응답/참고 vs 문서/문장)을 한 열로 눌러야 했다.

## 해결

- 열을 유형/ID/대표 표현/생성 시각으로 통일했다. 대표 표현은 유형별 인라인 표기(`[w1] ∩ [w2] = [답]` 등)다.
- 대표 표현은 두 단계로 만든다. `relations/computeRelationExpression`이 관계만 보고 `text`/`word`/`sentence`/`document` 토큰 배열을 만들고(순수, vitest),
  `hydrateRelationEntries`가 토큰에서 id를 모아 단어/문장/문서를 한 번에 해석해 `value`를 채운다. 어떤 id가 필요한지를 토큰 한 곳만 안다.
- `RelationExpression`이 토큰을 인라인 컴포넌트로 그린다. 셀 안은 `display: flex`이며 문장/문서 링크만 `flex: 0 1 auto; min-width: 5rem(후속 작업에서 0으로); overflow: hidden; text-overflow: ellipsis`로 줄어들고,
  단어 링크와 기호는 `flex: none`이다. 기호는 익명 텍스트로 두면 flex 컨테이너가 앞뒤 공백을 지우므로 `white-space: pre`인 `span`에 담았다.
- 행 클릭 이동(`RelationRow`)을 쓰지 않고 ID 셀만 `Link`(`search` 유지)다.
- `RecentSource.toEntry`가 유형을 거르지 않으므로 반대 유형 구간을 건너뛰는 비용이 사라졌다.
- 검색(`?q=`)은 유지하되, `qnaSearch.service`가 관계 원본을 돌려주는 `searchExactRelations`/`searchPartialRelations`를 노출하고 `useRelationSearch`가 새 표로 해석한다.
  개별 단어 페이지의 `연관 관계`와 배치 결과 표는 예전 `QnaTable`을 그대로 쓴다.
- 관계 짓기는 요청 원문의 `[w1] -[w2]→ [w3]` 대신 저장 의미(`word3`이 관계 이름)대로 `[w1] -[w3]→ [w2]`로 확정했다.
- 참고사항은 대표 표현에 없어, 참고사항으로만 일치한 검색 결과는 강조가 보이지 않는다. 판정 규칙은 그대로 두고 문서에 명시했다.
- `llm/기획/화면-페이지.md`가 직전 커밋(b04ce9c)에서 통째로 비워져 있어 `b04ce9c^`에서 복원한 뒤 `관계 목록`·`개별 관계` 절을 고쳤다.

## 알려진 한계

- (5rem 최소 폭은 후속 가독성 작업에서 폐지) 단어 링크만으로 칸을 넘치면 줄임표 없이 잘린다.
- 라우트 파일을 지우고 더한 뒤 `routeTree.gen.ts`는 vite 플러그인이 재생성하므로, 개발서버가 꺼져 있으면 `npx vite build`를 한 번 돌린 뒤 `tsc`/eslint를 돌려야 한다.

