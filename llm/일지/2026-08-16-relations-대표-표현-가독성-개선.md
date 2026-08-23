# 2026-08-16 `/relations` 대표 표현 가독성 개선

## 문제

통합 목록의 1차 표기가 읽기 불편했다. 예문 만들기는 대상 단어를 앞에 나열한 뒤 문장을 붙여 길었고,
관계 짓기의 `-[w3]→`은 화살표가 빈약했으며, 문장 추출은 문장 길이에 따라 `@ [문서]`의 위치가 행마다 흔들렸다.

## 해결

- 열을 ID / 유형 / 대표 표현 / 생성 시각으로 바꿨다.
- 토큰에 합성 종류를 더했다. `usage`(문장 id + 단어 id들)와 `extraction`(문장 id + 문서 id)은 렌더 단위가 하나의 덩어리라 낱개 토큰으로 풀면
  각 조각이 flex 아이템으로 따로 줄어드는 문제가 있었다. 해석 단계에서 `usage`는 `splitSentenceByWords`(순수, vitest)로 문장을 조각내 `segments`를 채우고,
  `UsageExpression`이 `span.truncated` 하나 안에 문장 조각 링크와 `<em>` 단어 링크를 인라인으로 그린다.
- 문장이 삭제됐거나 답이 문장이 아닌 예문 만들기는 `createUsageFallbackTokens`가 `(답변 회피)|(삭제됨)|[단어 답], 원 단어: [w1], [w2]`로 편다.
  이 헬퍼는 토큰 생성(`null`/단어 답)과 해석(삭제된 문장) 양쪽이 쓴다.
- 문장 추출은 `ExtractionExpression`이 `flex: 0 0 70%` / `flex: 0 0 30%` 두 영역으로 그려 `from`의 x 위치를 고정했다.
- 5rem 최소 폭은 사용자 요청으로 없앴다(`min-width: 0`).
- `(답변 회피)`, `(삭제됨)`은 `TextToken.isMuted`와 `.muted { color: var(--pico-muted-color) }`로 회색이다.
- 렌더 파일이 커져 `relations/RelationExpression/` 디렉토리로 나눴다(`RefLinks`, `UsageExpression`, `ExtractionExpression`).

