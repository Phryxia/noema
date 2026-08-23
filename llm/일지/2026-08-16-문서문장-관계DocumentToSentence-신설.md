# 2026-08-16 문서-문장 관계(DocumentToSentence) 신설

## 문제

문서에서 추출한 문장이 어느 문서에서 왔는지를 관계로 남겨야 했다. 개별 관계 화면 `/relation/<id>`를 그대로 쓰기로 했으므로
`relations`에 담겨야 하는데, 기존 `Relation`은 모두 문제에서 태어난 단어 관계라 `RelationBase.questionId`가 필수였고,
`hydrateQnaEntries`·`collectSearchTargets`·`loadRelationSnapshot` 등이 단어 필드를 전제로 짜여 있었다.
문장은 `createSentence`가 건당 트랜잭션을 열어 `createdAt`을 각자 찍으므로 "제출 시각이 모두 같아야 한다"를 만족할 수 없었다.
또 `/relations/w2w`와 `/relations/d2s`가 같은 스토어의 `createdAt` 인덱스를 커서로 훑는데, 서로 상대 유형을 걸러야 했다.

## 해결

- `RelationBase`를 `{ relationId, createdAt, modifiedAt? }`로 줄이고 `WordRelationBase`(`questionId`, `comment`)를 끼워 넣었다.
  기존 10개 유니온은 `WordRelation`, 스토어 타입은 `Relation = WordRelation | DocumentToSentenceRelation`.
  단어 전용 코드는 `WordRelation`을 받도록 컴파일러가 잡는 대로 이름만 바꿨고, 스토어 경계(`getRelation`, `getAllRelations`, `QnaRelationSource`,
  `deleteRelation`, `loadRelationSnapshot`)만 `type === 'DocumentToSentence'`로 가른다. filter 자리는 `checkIsWordRelation`.
- `relations`에 `documentId`, `sentenceId` 인덱스를 `IndexSpecs`에 더하고 `DB_VERSION`을 10으로 올렸다. `ensureIndexes`가 멱등이라 마이그레이션 코드는 없다.
  `indexSpecs.ts`를 먼저, `DB_VERSION`을 마지막에 저장해 HMR 중간 상태에서 버전만 소모되는 일을 피했다.
- `createSentence`의 삽입 본문을 `sentenceTx.ts#addSentences(transaction, values, source, createdAt)`로 뽑아
  `submitExtraction`이 `[sentences, recentSentences, relations]` 한 트랜잭션에서 문장과 관계를 같은 `createdAt`으로 넣는다.
  탐색 제출이 트랜잭션을 나누는 이유(다른 트랜잭션 대기)가 여기엔 없어서 하나로 묶을 수 있었다.
  통계는 `recordCreation(db, kind, amount)`로 건수를 한 번에 기록한다.
- 목록 필터는 `RecentSource.toEntry`가 `null`을 돌려주면 `readPage`가 `cursor.continue()`로 건너뛰게 했다.
  별도 `filter` 필드보다 타입이 깔끔하다(`toEntry`가 `WordRelation | null`을 돌려주니 `hydrate`가 `WordRelation[]`을 받는다).
- 문장 수정의 관계 영향 질의에 `sentenceId` 인덱스 건수를 더했다. 문서 수정은 사양대로 묻지 않는다.

## 남은 것

- 두 히스토리가 한 인덱스를 공유하므로 반대 유형이 몰린 구간을 커서가 지나가는 비용이 있다. 규모가 커지면 `['type', 'createdAt']` 복합 인덱스로 d2s 쪽을 먼저 줄인다.
- `hydrateD2sEntries`는 `resolveSentenceMap`처럼 문장·문서를 건당 트랜잭션으로 읽는다. 문서 하나에 문장이 수백이면 한 트랜잭션 `getAll`로 바꿀 여지가 있다.
- v9 이하 백업 파일은 `parseBackup`의 버전 검사로 가져올 수 없다(기존 정책).

