# 2026-07-22 WordWriter 중복 단어 저장 차단

## 문제

`createWord`는 도착 Trie 노드에 `createdAt`이 있으면 no-op이라 데이터는 안전했지만, UI는 그 사실을 몰랐다. 이미 있는 단어를 다시 입력해도 저장 버튼이 활성화되고 `Enter`도 먹었다. 사용자에게는 저장을 눌렀는데 입력창만 비워지는 것으로 보였다.

## 해결

`WordWriter`에서 `getWordNodeId`를 100ms throttle된 입력값으로 조회해 `isExisting`을 만들고, 버튼 `disabled`와 `handleSubmit` 조기 반환에 반영했다. 새 서비스 함수는 만들지 않았다. `WORD_NODE_ID_QUERY_KEY`는 `word.$word.tsx`가 이미 쓰던 키라 캐시가 공유된다.

- `throttledValue === value` 가드를 함께 건다. throttle 지연 중의 조회 결과는 이전 입력값에 대한 답이므로, 그 사이에는 중복이 아니라고 본다. 잘못 비활성화하는 것보다 잠깐 활성화된 채로 두는 쪽이 낫다. 서비스가 no-op이라 최악이라도 무해하다.
- 판정은 `typeof existingNodeId === 'number'`다. 미조회는 `undefined`, 미존재는 `null`이라 둘 다 걸러야 하고, `nodeId` 타입상 `0`이 truthy 검사에 걸린다.

`WORD_NODE_ID_QUERY_KEY`가 그동안 어디서도 무효화되지 않던 것이 이 변경으로 실제 버그가 됐다. 저장/삭제 후 같은 문자열을 다시 입력하면 낡은 캐시가 먼저 반환되어 판정이 뒤집힌다. 특히 `WordSuggestion`에서 삭제한 단어를 다시 저장하지 못한다. 무효화 대상이 3개로 늘어 두 컴포넌트에 같은 블록이 복사되므로 `word/utils.ts`의 `invalidateWordQueries(queryClient)`로 뽑아 양쪽에서 호출한다.

앞뒤 공백 정규화(trim)는 사용자 결정에 따라 하지 않는다. 스페이스만으로도 단어를 만들 수 있다는 기존 사양과 충돌하기 때문이다.

