# 2026-08-13 관계 짓기(NamedAssociation) 유형 신설

## 문제

`relation/types.ts`에 선언만 있던 `NamedAssociation`(word1 --word3--> word2 유향 관계)을
알려주기·관계 목록·개별 관계 페이지에 연결하되 탐색에는 출제하지 않아야 했다.
세 단어 입력기를 `단어 1 ── 관계 ──▶ 단어 2` 한 줄로 놓고, 포커스 순서도 보이는 순서(word1 → word3 → word2)여야 하며,
word3의 Enter는 제출이 아니어야 했다.

## 해결

세 단어를 모두 대상 단어로 다루는 답안 없는 유형으로 모델링했다(`SubjectWordSpecs` 3/3, `checkIsAnswerReady`의 무응답 그룹).
저장 형태는 `TernaryIsolation`과 같아 DB 버전과 인덱스는 무변경이다.

- **시각 재배치는 렌더 계층에서만**: words 배열은 `[word1, word2, word3]`을 유지하고,
  `SubjectWordFields`의 `isDirected` 분기가 DOM을 [0, 2, 1] 순으로 그린다. 포커스/Tab/Enter 이동은
  DOM 순서를 따르므로 요구된 포커스 순서가 저절로 나온다. 제출·복원(`createRelationQuestion`,
  `getQuestionWordIds`) 로직은 배열 순서 그대로라 손댈 곳이 없었다.
- **Enter 규약은 기존 메커니즘 재사용**: 대상 단어 칸은 `onEnter=leaveField`(포커스 이동, 제출 차단)이고,
  참고사항 단어 모드는 `onEnter` 미전달이라 브라우저 기본 submit → `isSubmittable` 가드. 신규 코드 없음.
- **답안란 제거**: `RelationForm`에서 `type !== 'NamedAssociation'`일 때만 `AnswerSection`을 그린다.
  수정 페이지의 답안 복원은 `getRelationAnswer`가 `null`을 돌려줘 WordsUsage 회피와 같은 경로로 흡수된다.
- **목록 표시**: `hydrateQnaEntries`에서 문제 열은 `words.slice(0, 2)`(`getDisplayWords`),
  응답 열은 `{ kind: 'selection', word: words[2] }`로 기존 `WordLink` 렌더를 재사용했다.
- **탐색 제외**: `ExploreQuestionTypes` 상수를 만들어 `ExplorePage`가 `useExplore`/`QuestionTypeSelector`에
  `availableTypes`로 넘긴다(`lab/embedding`의 `LabQuestionTypes` 선례). `loadCheckedTypes`가
  `availableTypes.filter`라 localStorage 잔존 체크도 자동 차단된다. `pickQuestion.createNewQuestion`의
  default 분기는 컴파일 에러가 나서 명시 case로 풀어냈고, `NamedAssociation`은 throw로 막았다.
- `SubjectWordFields.tsx`가 200줄을 넘게 되어 내부 `SubjectWordField`를 같은 디렉토리의 별도 파일로 분리했다.
- HMR 안전을 위해 유형 노출(`QuestionTypeOptions`의 `{ value, label: '관계 짓기' }`)을 마지막에 저장했다.
- 기획 명세는 [알려주기](../../기획/화면/알려주기.md)에 적었다. `기획/탐색.md`는 250줄로 분리 대기 중이라
  건드리지 않았고, 탐색에 출제하지 않는 유형이므로 알려주기 문서가 맞는 자리다.

## 남은 것

- 기존 중복 금지 규칙에 따라 word3(관계 이름)도 word1/word2와 같을 수 없다. 자기 자신을 잇는
  이름이 필요해지면 `checkSubjectWordsReady`를 유형별로 완화해야 한다.

