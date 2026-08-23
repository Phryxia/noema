# 2026-08-16 문장-단어 관계(SentenceToWord) 신설

## 문제

[단어 추출](../../기획/화면/단어-추출.md)이 (문장, 단어) 관계를 필요로 했다. 세 가지가 걸렸다.

1. 인덱스를 새로 만들면 `DB_VERSION`을 올려야 하는데, 개발서버가 켜진 채 여러 파일을 저장하면 중간 상태로 업그레이드가 돌아 버전만 소모된다.
2. `type !== 'DocumentToSentence'`가 "단어 관계다"의 동의어로 `checkIsWordRelation`, `deleteRelation`에 흩어져 있었다. 유형이 하나 더 생기면 전부 틀린다.
3. 단어와 관계의 `createdAt`이 같아야 하는데 `createWord`는 자기 트랜잭션을 열고 자기가 `new Date()`를 찍었다.
   게다가 결과 모달이 "새로 만든 단어인가"를 알아야 하는데 `createWord`는 `nodeId`만 돌려줬다.

## 해결

- `wordId`(`WordExplain`용)와 `sentenceId`(`DocumentToSentence`용) 인덱스를 그대로 탄다. 키 경로가 같아 새 레코드가 저절로 색인되므로 DB 변경이 없다.
  대신 인덱스가 두 유형을 섞어 담게 되어, `d2s.service`와 `s2w.service`가 `getAll` 결과를 `type`으로 거른다.
  이 필터를 빼먹으면 개별 문장 페이지의 `연결된 문서`에 단어 관계가 샌다.
- `wordId` 인덱스 공유는 덤이 있다. `hasWordReferences`/`countReferencingRelations`가 이 관계를 세므로 추출된 단어 삭제가 대체 단어를 요구하고,
  `replaceWordReferences`가 `wordId` 필드를 바꾸므로 개명·대체가 관계를 따라온다. 타입을 `WordRelation`에서 `Relation`으로 넓히고 `comment` 접근에 `in` 가드를 뒀다.
  문서-문장 관계가 단어 인덱스에 닿지 않는 것과 대조된다.
- 판정은 `relation/consts.ts`의 `NonWordRelationTypes` 집합을 보는 `checkIsWordRelation` 하나로 모으고, `deleteRelation`의 스토어 범위와 `questions` 삭제도 그것을 쓴다.
  유형이 또 늘어도 집합만 고치면 된다.
- `createWord`의 몸통을 `wordTx.addWord(transaction, value, createdAt)`로 뽑아 `{ nodeId, isCreated }`를 돌려주게 했다.
  `createWord`는 트랜잭션을 열고 이 헬퍼를 부른 뒤 `isCreated`일 때만 통계를 기록한다. 예전에는 같은 판정을 인라인으로 하고 있었다.
- `submitWordExtraction`은 `[wordMeta, wordNodes, recentWords, relations]` 단일 트랜잭션에서 값마다 `addWord` → `relations.add`를 돌린다.
  값 하나의 예외는 `try`/`catch`로 잡아 결과에만 적고 요청을 내보내지 않는다. 실패한 요청을 내보내면 트랜잭션 전체가 죽어 앞의 단어까지 잃는다.
- 중복 카드는 `Set`으로 순서를 지키며 삽입 전에 하나로 줄인다. UI에서는 합치지 않는다(사양).

