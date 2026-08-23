# 2026-08-23 질문 유형 라벨·목록을 `QuestionSpecs`로 이관

## 문제

이전 세션의 검토 의견 두 가지를 재검토했다.

1. `explore/types.ts`의 `AnswerDraft`(flat 5필드)와 `relation/questionSpecs.ts`의 `QuestionAnswer`(판별 유니온)가 같은 축을 두 번 표현하며, kind 추가 시 컴파일러가 잡지 못한다.
2. `relation/typeStorage.ts`가 `explore/consts.ts`의 `QuestionTypeOptions`를 localStorage 값 화이트리스트로 쓴다.

1번은 결론(지금 손대지 않음)은 맞지만 근거가 틀렸다. `checkIsAnswerReady`와 `createAnswerFields`는 반환형이 명시된 `default` 없는 `switch`라 kind가 늘면 컴파일러가 잡는다. flat 폼 상태는 `RelationPage`에서 입력 도중 유형을 바꿔도 값이 보존되게 하는 의도된 설계이며, 스펙이 상태를 해석하는 관계이지 축 복제가 아니다. 보류.

2번은 정당하며 규모가 더 컸다. `relation`, `word`, `qna`, `relations`가 전부 `explore/consts`의 상수에 의존해, 하위 모듈이 상위 기능을 바라보는 역방향 의존이었다. 또 `QuestionTypeOptions`의 표시 순서와 `QuestionSpecs`의 키 순서가 달라(`UnaryProperty`가 3번째 vs 7번째) 단순 파생으로는 순서가 바뀔 위험이 있었다.

## 해결

- `QuestionSpec`에 `label` 추가, 키 순서를 표시 순서로 재배열.
- 같은 파일에서 `WordRelationTypes = Object.keys(QuestionSpecs)`, `QuestionTypeOptions`를 파생.
- 소비처 7곳의 import를 `relation/questionSpecs`로 교체. `typeStorage`는 `WordRelationTypes`로 검증, `getQuestionTypeLabel`은 `QuestionSpecs[type].label`로 단순화, `useExplore`의 `AllQuestionTypes` 지역 상수 제거.
- `explore/consts`에서 `QuestionTypeOptions` 정의 제거, `ExploreQuestionTypes`는 `WordRelationTypes.filter`로.

