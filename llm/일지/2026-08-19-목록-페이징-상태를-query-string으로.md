# 2026-08-19 목록 페이징 상태를 query string으로

## 문제

`/relations` 히스토리 표와 `/recent/*` 셋은 기간·현재 페이지·탐사 상태를 전부 `useRecentPages`의 지역 상태로 들고 있었다.
표의 ID 링크로 개별 페이지에 들어갔다 뒤로가기로 돌아오면 컴포넌트가 새로 마운트되며 1페이지로 리셋됐다.

요구는 `from`, `to`(밀리초 유닉스 시각), `page`(1-based 정수)를 query string으로 제어하고,
없거나 잘못된 값은 기본값으로 보되 기본값을 URL에 되쓰지는 않는 것이다.
1이 아닌 페이지로 다이렉트 진입할 때는 Indexed DB 커서의 `advance`를 쓰고,
네비게이터는 그 페이지 하나만 노출한 뒤 좌우 이동으로 넓어지게 한다.

## 해결

- **커서 시작점**: `getRecentPage`의 세 번째 인자를 `RecentCursor | null`에서
  `RecentStart = {kind:'offset', offset} | {kind:'cursor', cursor}` 유니온으로 바꿨다.
  `readPage`의 첫 `onsuccess`에서 한 번만 소비하며, `cursor`면 종전처럼 `continuePrimaryKey`,
  `offset > 0`이면 `cursor.advance(offset)`이다. `advance(0)`은 예외를 던지므로 0은 아무것도 하지 않는다.
- **advance의 전제**: 인덱스 레코드 수와 표에 실리는 행 수가 같아야 offset이 맞는다.
  `RecentSource.toEntry`의 반환 타입에서 `| null`을 떼어 이 전제를 구조적으로 고정했다.
  네 소스 모두 실제로 `null`을 돌려주지 않았고, 단어는 `createdAt` 없는 Trie 중간 노드가
  애초에 인덱스에 안 들어가는 방식으로 이미 걸러내고 있었다.
- **페이지 조회**: `ensureRecentPage`가 `ensureQueryData`로 `page-1`을 재귀 조회하던 사슬을 없앴다.
  `getQueryData`로 앞 페이지가 캐시에 있으면 그 다음 커서에서 이어 읽고(순차 이동), 없으면 `advance((page-1)*10)`으로 건너뛴다.
  8페이지 다이렉트 진입이 앞 7페이지 hydrate 없이 커서 한 번으로 끝난다.
- **탐사 구간**: `computePagination`의 `loadedPageCount`를 `exploredFrom`/`exploredTo`로 갈랐다.
  창은 `[max(exploredFrom, cur-2), min(exploredTo, cur+2)]`이고 앞쪽 줄임표는 `from > 1`이다.
  `exploredFrom`이 1이면 결과가 종전과 완전히 같아, 메모리 페이징의 `useExploredPagination`은 `exploredFrom: 1`만 넘기면 됐다.
  구간 상태는 `useExploredRange`가 갖고, `rangeKey`가 바뀌면 리셋·현재 페이지가 구간을 벗어나면 확장하는 렌더 중 상태 조정 패턴을 쓴다.
- **URL 읽기/쓰기**: `useRangePageParams` 하나가 `useSearch({ strict: false })`로 읽고 `useNavigate()`로 쓴다.
  `RecentListSection`이 네 라우트에서 쓰이므로 라우트별 `getRouteApi`를 쓸 수 없었다.
  쓰기는 `navigate({ to: '.', search: (previous) => ... })`다. `to`가 없으면 대상 search 타입이 `never`로 잡혀 컴파일이 안 되고,
  함수형 갱신이라 `/relations`의 `q`가 자동으로 보존된다.
- **`q` 보존**: `RelationsPage`의 검색/취소가 `search: { q }`, `search: {}`로 전체를 덮어써 `from`/`to`/`page`를 날렸다.
  둘 다 함수형 갱신으로 바꿨다. 취소는 `q: undefined`로, TanStack이 `undefined` 키를 URL에서 지운다.
- **기간 폼 동기화**: `RangeSearchForm`은 `useState`로 초기값을 한 번만 받으므로 뒤로가기로 `from`/`to`가 바뀌어도 옛 값을 붙들고 있었다.
  `key={rangeKey}`로 리마운트시켰다.
- **`to` 기본값**: 마운트당 한 번 `useState(() => toInclusiveMinuteEnd(new Date()))`로 고정한다. 매 렌더 `new Date()`면 캐시 키가 흔들린다.

## 겪은 것

`validateSearch`에 `parseRangePageParams`를 달았는데도 `?page=1.5`가 1.5페이지로 조회되고 네비게이터에 `1.5`가 찍혔다.
`useSearch({ strict: false })`가 라우트별로 검증된 객체가 아니라 `location.search` 원본을 돌려주기 때문이다.
`?to=`(빈 문자열)이 `new Date('')`로 흘러 Invalid Date 범위가 되어 결과가 통째로 비는 것도 같은 원인이었다.
훅 안에서 `parseRangePageParams(useSearch({ strict: false }))`로 한 번 더 걸러 해결했다.
라우트의 `validateSearch`는 네비게이션 때 키가 잘려나가지 않게 하는 역할로 남는다.
입력 타입은 `Record<string, unknown>` 대신 `{from?: unknown; to?: unknown; page?: unknown}`로 둬서
`validateSearch`의 인자와 병합된 search 타입 양쪽에서 받는다.

## 남은 것

전체 페이지 수보다 큰 `page`로 들어오면 커서가 끝을 넘겨 빈 목록이 되고, 그 번호 하나만 노출된 채 뒤쪽이 닫힌다.
`<<`나 `<`로 빠져나올 수 있으므로 그대로 뒀다.
`to`를 URL에 되쓰지 않으므로 재진입 때 종료 시각이 새 진입 시각이 되어, 그 사이 추가된 항목만큼 내용이 밀린다.

메모리 페이징(`PagedSection`: 관계 검색 두 구역, 개별 단어·문장·문서의 하위 구역)은 손대지 않았다.
한 화면에 구역이 여럿이라 `page` 하나로는 안 되고 구역별 파라미터 이름이 필요하다.

## 검증

vitest 120개(`computePagination` 4개 신규), tsc, eslint, prettier 통과.
playwright headless로 dev 서버에 붙어 문장 85건·관계 85건·단어 25건을 시드하고 확인했다.

- `>` 두 번 → `?page=3`, ID 링크 진입(`/relation/65?page=3`) 후 뒤로가기 → 3페이지 유지
- `?page=8` 다이렉트 진입 → `<< < ... 8* ... >`, 15번 관계부터 10행. `<`로 `... 7* 8 ...`, `>>`로 9페이지에서 5행·`>` 비활성, `<<`로 `1* 2 3 ...`
- `?page=0`, `?page=1.5`, `?page=-3`, `?from=xyz&to=` → 모두 1페이지로 동작하고 URL은 그대로
- `?page=99` → 빈 목록, `99`만 노출
- `?q=<문장>&page=4` → 검색 결과만 보이고, 입력을 비우면 `?page=4`로 돌아가 4페이지 히스토리가 그대로 드러남
- `/recent/sentences?page=8`, `/recent/sentences?from=…&to=…&page=2`(폼 입력칸이 `00:30`/`01:00`으로 채워짐), `/recent/words?page=2`(Trie 복원 정상)

