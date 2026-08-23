# 2026-08-03 Prefix Additive Online Bayesian

## 문제

임베딩 실험장의 Naive 모델은 단어를 전부 독립으로 취급해, 접두사를 공유하는 단어 사이에 일반화가 일어나지 않았다.
[기획](../../기획/탐색-임베딩실험.md)의 개선안대로 Trie 노드별 임베딩의 경로 합으로 단어 임베딩을 정의해야 했다.
의사코드는 문자열 Trie를 새로 짓지만, 프로젝트에는 이미 IndexedDB `wordNodes`가 Trie다.

## 해결

기획서 말미의 지시대로 임베딩을 DB Trie의 노드 id에 바인딩했다. 새 모듈 `word/getWordTrie.ts`가
`wordNodes`를 `getAll()` 한 번으로 읽어 `{ parents, children, wordNodeIds }` 스냅샷을 만들고,
모델 코어(`embedWord`, `updateModel`, `proposePair`, `evaluateAccuracy`)는 전부 이 스냅샷을 인자로 받는다.
DFS 중 노드당 DB 왕복을 피하기 위한 구조다.

- `EmbeddingModel.words`(단어별)를 `nodes`(노드별)로 교체. 단어 임베딩은 경로 노드의 `mu`/`varr` 합.
- `updateModel`은 갱신 전 경로 합(`eu`/`ev`)을 스냅샷한 뒤 두 경로의 노드를 순차 갱신한다(의사코드와 동일).
  Naive 구현이 갱신 도중 값을 읽던 것과 달리, 의사코드가 스냅샷 기준이라 그쪽을 따랐다.
- `proposePair`는 노드별 노이즈를 `Map`으로 1회만 샘플링하고, 누산기 증감으로 Trie를 DFS한다.
  `u` 경로에서 뽑힌 노이즈가 후보 점수에도 재사용되는 결합이 의사코드의 핵심이라 그대로 유지했다.
- `evaluateAccuracy`는 호출 1회 내에서 단어별 경로 합 `mu`를 메모이즈했다. 매 스텝 전체 재평가 비용 때문이다.
- 출제 직전마다 `getWordTrie()`로 스냅샷을 갱신해, 응답 처리 시점의 Trie에 그 문제의 경로가 항상 존재한다.
- Local Storage 스키마는 v2(`nodes`)로 올렸다. 노드 임베딩과 단어 임베딩은 의미가 달라 v1은 복원하면 안 되는데,
  기존 버전 검사가 불일치 시 빈 배열을 돌려주므로 자동 폐기된다.
- 테스트는 고정 Trie 헬퍼로 재작성했다. 접두사 공유 단어로의 일반화, 경로 밖 노드 불변,
  `Math.random`을 0으로 고정해(Box–Muller가 0을 뱉는다) `proposePair`의 argmax·라벨 필터·폴백을 결정적으로 검증했다.

탐색 페이지(`explore/`)는 수정하지 않았다. `word/getAllWordNodeIds.ts`는 이 교체로 사용처가 사라졌으나,
llm 밖 파일 삭제는 허가가 필요해 남겨 두었다.

## 남은 것

사용 중 특정 단어가 상대로 연속 출제되는 현상이 나왔다. `v`가 argmax인 데다 `bias = -2`가
라벨 1/0의 갱신량을 비대칭(약 7배)으로 만들어, 한 번 관계를 얻은 단어의 norm이 커지는 되먹임이 원인이다.
`EMBEDDING_BIAS`를 0으로 바꿨더니 validation accuracy가 극도로 낮아져 -1로 절충했고,
argmax는 Gumbel-max 트릭(`argmax(s + τG)`, softmax 샘플링과 동치, `τ = 1`)으로 교체했다.
후보당 노이즈 한 줄 추가라 복잡도는 그대로다. 테스트는 `sampleGumbel`을 0으로 모킹해 결정성을 유지했다
(`Math.random` 0 고정 시 Gumbel이 무한대로 발산해 모듈 모킹으로 전환). 쿨다운은 보류 중이다.

이후 실험 페이지에도 유형 체크박스를 넣었다(기획 변경). `useExplore`의 `fixedTypes`를
`availableTypes` + `checkedTypesStorageKey`로 일반화해, 두 페이지가 같은 로직으로 각자의
유형 모집단과 저장 키(`lab/embedding/checkedTypes`)를 갖는다. `QuestionTypeSelector`는
선택적 `availableTypes`로 표시 유형을 거르고, `pickLabQuestion`은 체크된 유형을 인자로 받아
그 안에서만 출제한다(전부 해제 시 `noType`). 탐색 페이지는 옵션 기본값 경로라 동작 변화가 없다.

이후 bias를 학습 파라미터로 바꿨다(기획 변경). `EmbeddingModel`에 스칼라 `bias: { mu, varr }`를 두고
사전분포 `N(-3, 1)`에서 시작, 입력 계수가 1이라 `mu += varr * err`, `varr /= 1 + varr * gain`으로
노드와 같은 방식으로 갱신한다. 수동 튜닝(-2 → 0 → -1)을 데이터가 대신한다.
모든 후보에 동일하게 더해지므로 출제 선택 확률에는 영향이 없다. 저장 스키마는 v3(`bias` 필드)로 올렸다.

