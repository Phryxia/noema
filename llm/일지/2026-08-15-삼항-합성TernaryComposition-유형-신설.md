# 2026-08-15 삼항 합성(TernaryComposition) 유형 신설

## 문제

`word3 = word1 + word2`인 관계를 저장해야 했다. 탐색에서는 word3만 주어지고 두 단어를 답하는데,
알려주기에서는 관계 짓기처럼 세 칸을 한 줄에 놓고 싶었다. 문제 레코드에 세 단어를 모두 넣으면
탐색 초안 시점에 모르는 word1/word2를 문제에 둘 수 없고, word3만 넣으면 알려주기의 세 칸을 문제 하나로 대응할 수 없었다.
또 동일 조합 중복 검사를 알려주기·수정·탐색 모두에 걸어야 했는데, 기존 검사는 알려주기 전용으로 문자열 단어를 받았다.

## 해결

연상(`BinaryAssociation`)의 기조를 따랐다. 문제는 주어진 것(`word3Id`)만 담고, 답한 두 단어는 `AnswerDraft.words`에 두었다가
제출 시 `createAnswerWordIds`로 순차 `createWord`해 관계의 `word1Id`/`word2Id`가 된다(`createNewRelation`은
`RelationTargets { answer, answerWordIds, comment }` 객체를 받도록 바꿨다). 알려주기도 대상 단어 1칸 + 답안 두 단어로 같은 모델을 쓰고,
한 줄 배치는 화면 계층에서 만든다. `getQuestionWordIds`는 `[word3Id]`, 신규 `getRelationAnswerWordIds`는 `[word1Id, word2Id]`를 돌려
수정 페이지 복원과 QnA 목록(`composition` 답 종류)이 같은 함수를 쓴다.
중복 검사는 `assertNotDuplicateNamedAssociation`을 `assertNotDuplicateTernaryRelation(type, TernaryWords | null, excludeId?)`로 바꿔
id 삼중항을 받게 했고, `getTernaryWordIds(question, answerWordIds)`가 유형별로 삼중항을 만든다.
호출 위치를 `submitRelation`에서 `submitAnswer`(탐색·알려주기 공용)와 `updateRelation`으로 옮겨 탐색 제출도 걸리게 했다.
단어를 먼저 만들고 검사하지만, 중복이면 세 단어가 이미 있으므로 `createWord`는 no-op이라 부작용이 없다.
DB 버전과 인덱스는 바꾸지 않았다.

