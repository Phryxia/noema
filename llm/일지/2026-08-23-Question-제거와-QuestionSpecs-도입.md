# 2026-08-23 Question 제거와 QuestionSpecs 도입

## 문제

`questions` Store는 제출마다 쓰였지만 어디서도 읽히지 않았고, 관계가 이미 대상 단어를 전부 복사해 갖고 있어 정보가 중복이었다.
`Question` 타입은 유형별로 `wordId`/`word3Id`/`wordIds` 등 필드가 제각각이라 `pickQuestion`, `createRelationQuestion`, `createNewRelation`,
`checkIsAnswerReady`, `getQuestionWordIds`, `getTernaryWordIds` 등이 모두 10갈래 switch를 반복했다. 유형을 하나 더하면 여섯 군데를 고쳐야 했다.
`UnaryProperty`/`BinaryAssociation`/`TernaryComposition`/`NamedAssociation`은 필드 구성이 둘로 나뉠 뿐인데 인터페이스가 넷이었다.

## 해결

네 커밋으로 나눴다.

1. 타입 통합: `BinaryRelation { type: 'UnaryProperty' | 'BinaryAssociation' }`, `TernaryRelation { type: 'TernaryComposition' | 'NamedAssociation' }`.
   `QuestionType`은 `WordRelationType = WordRelation['type']`로 대체. `answer`/`similarity`/`selection`이 있는 유형은 그대로 뒀다.
2. `relation/questionSpecs.ts`에 `QuestionSpecs: Record<WordRelationType, { given, answer, subject }>`를 선언했다.
   `given`은 `'wordId' | 'wordIds' | WordKey[]`, `answer`는 `text(modes, isRequired) | similarity | selection | words(slots, layout, placeholders) | none`.
   기존 `SubjectWordSpecs`는 `subject`로 흡수했다.
3. 문제는 `RelationQuestion { type, wordIds }`만 남기고, 위 함수들을 스펙 조회로 바꿨다. `createNewRelation`은 필드를 조립한 뒤 `as NewRelation` 한 번으로 끝낸다.
   속성/연상의 답도 `words` kind로 통일해 `SubjectWordFields`로 입력받고, QnA 표의 `composition` kind를 `words(separator)`로 일반화했다.
   `readWordKeys(relation, slots)`로 유니온에서 키을 읽는다.
4. DB v11: `questions` 삭제, `relations` 커서 순회로 `questionId` 제거. 백업 가져오기에서도 `questionId`를 벗긴다.
   문장 `source`에 `relationId`를 넣어야 하므로 제출 절차를 `{ type, createdAt }`만 `add` → 문장 생성 → 완성 관계 `put`으로 바꿨다(`rid=`).

## 후속 점검

- `reserveRelationId`가 `createdAt`을 함께 넣어 `/relations` 목록(`createdAt` 인덱스 순회)에 빈 행이 보였다. `{ type }`만 예약하고 실패 시 `delete`하도록 고쳤다.
- `isExplorable`을 스펙에 두고 `ExploreQuestionTypes`를 거기서 도출한다.
- 백업 가져오기는 `version > DB_VERSION`만 거부하고, 낮은 버전은 `upgradeBackup`이 현재 스키마로 승격한다(v11 미만: `questions` 폐기, `questionId` 제거). v9 `corpus.json`을 손대지 않고 가져와 확인했다.
- `createNewRelation`, `checkIsAnswerReady`, `getTernaryWordIds`, `upgradeBackup` 단위 테스트를 추가했다(vitest 113개).

## 검증

vitest 99개, tsc, eslint, prettier 통과. 개발서버는 꺼져 있었으므로 버전 상수를 마지막에 저장했다.
playwright 영속 프로필로 이전 커밋 코드에서 `corpus.json`(v10 사본)을 가져와 `questions` 2386건을 만든 뒤, 새 코드로 열어
스토어 삭제·`questionId` 0건을 확인했다. 탐색 9유형 제출(문장 `source`에 `rid=`), 알려주기 삼항 합성 중복 차단(`이미 있는 관계입니다`),
속성/관계 짓기 저장, QnA 표 표시(`A - B`, `C = A + B`, `A ──R─→ B`), 개별 관계 편집(`modifiedAt` 갱신)과 삭제를 확인했다.

