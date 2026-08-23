# 2026-08-15 속성(UnaryProperty) 유형 신설

## 문제

`word1`이 `word2`의 속성을 갖는다는 이항 관계가 필요했다. 알려주기와 탐색 양쪽에 노출해야 하는데,
탐색에서는 랜덤 단어 1개만 주어지고 속성은 사용자가 답한다. 문제 레코드에 두 단어를 모두 넣으면
탐색 초안 시점에 모르는 속성 단어를 문제에 둘 수 없다.

## 해결

연상(`BinaryAssociation`)과 저장 구조가 완전히 같음을 확인하고 새 코드를 만들지 않았다.
문제는 `{ type, wordId }`, 관계는 `RelationBase & BinaryWords`이며, 답한 속성 단어가 `word2Id`가 되어 `answer` 필드가 없다.
`getRelationAnswer`, `getQuestionWordIds`, `getAnswerModes`, `pickQuestion.pickWordCount` 네 곳의 `BinaryAssociation` 분기에
`UnaryProperty`를 `||`로 더하고, exhaustive switch 4곳(`createRelationQuestion`, `createNewRelation`, `getQuestionPrompt`,
`pickQuestion.createNewQuestion`)에 case를 추가했다. `createNewRelation`은 기존 `requireWordTarget`을 그대로 쓴다.
답이 `word2Id`가 되므로 `getAnswerModes`에서 `WordOnlyModes`를 반환해 문장 답을 막는 것이 유일한 제약이다.
화면(`AnswerSection`, `RelationForm`, `SubjectWordFields`), 복원(`loadRelationSnapshot`), 목록(`hydrateQnaEntries`),
검색(`collectSearchTargets`)은 기본 경로가 그대로 맞아 손대지 않았다. DB 버전과 인덱스도 바꾸지 않았다.

유형 목록(`QuestionTypeOptions`)에서는 이름의 Unary를 따라 예문 만들기 뒤, 이항 그룹 앞에 두었고
소스 코드의 유니온·switch 순서도 같게 맞췄다. 탐색 체크박스는 localStorage에 저장된 목록과 교집합을 잡으므로
기존 사용자에게는 `속성`이 처음에 꺼진 채 보인다. 삼항 합성 때와 같은 동작이라 그대로 두었다.

