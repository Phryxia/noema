# 2026-08-24 db -> statistic 역참조 제거

## 문제

`db/openNoemaDB.ts`가 `onupgradeneeded`에서 `../statistic/backfillCountLogs`를 값 import 했다.
이 한 줄로 인프라 계층인 `db/`가 `statistic/consts`·`types`·`utils`를 끌어왔고, 디렉토리 경계로 보면
`statistic.service` -> `openNoemaDB` -> `statistic/backfillCountLogs`로 `db <-> statistic`이 양방향이었다.

백필이 실제로 필요한 것은 스토어 매핑과 시간 비닝뿐인데, `statistic/utils.ts`에는 그 순수 함수들이
`invalidateStatisticQueries`·`formatBinLabel` 같은 화면 함수와 한 파일에 섞여 있었고,
`statistic/consts.ts`에는 `CountStores`가 계열 색·라벨과 함께 있었다. 파일 단위 의존이라 화면 쪽까지 딸려왔다.

비용은 번들이 아니었다. `statistic/utils.ts`의 외부 값 의존은 0이라(`QueryClient`는 `import type`)
딸려오는 코드는 tree-shaking 대상이다. 실제 비용은 통계 스키마를 고칠 때마다 DB 업그레이드 경로가
리뷰 대상이 되는 것, 그리고 HMR 중간 상태에서 마이그레이션이 잘못 실행될 위험 구간이 화면 코드 저장까지
넓어지는 것이었다.

## 해결

저장 계층 지식을 `db/countLog/`로 내리고 `statistic/`을 순수 화면 계층으로 만들었다.
`types`(레코드 형태), `consts`(스토어 매핑), `binning`(`getBinDate`, `shiftBin`, `createLog`),
`backfill`이 `db/` 안에서 닫힌다. `statistic/`에는 쿼리키, `BinCounts`, 라벨, `CountSeriesList`,
`createBins`, `formatBinLabel`, `invalidateStatisticQueries`만 남았다.

`migrations/`로 옮기지 않은 이유는 `types`/`consts`/`binning`을 `getCountLogs`와 `recordCreation`이
상시 쓰기 때문이다. 마이그레이션 전용인 것은 `backfill.ts` 하나뿐이라 그것만 `countLog/` 안에 둔다.

`CountKinds`의 파생 방향도 뒤집었다. 이전에는 `CountKinds = CountSeriesList.map((s) => s.key)`로
저장 개념이 화면 상수(색·라벨)에서 파생됐다. 지금은 `db/countLog/consts`가 리터럴로 갖고,
`statistic/consts`가 `Record<CountKind, CountSeries>`를 `CountKinds` 순서로 배열화한다.
항목 누락은 `Record`가 컴파일 타임에 잡으므로 이전의 자동 일관성을 잃지 않는다.

`statistic.service.ts`의 `rebuildCountLogs`도 함께 지웠다. 커밋 로그를 보면 이 함수는
`0528621`(2026-07-23)에서 임시 백필 버튼 `RebuildCountLogsButton`과 함께 들어왔는데,
그 버튼은 로컬 작업 트리에만 있었고 커밋되지 않았다. 23분 뒤 `5ce6316`이 "컴포넌트와 `rebuildCountLogs`를
지운다"는 `plan.md` 할 일 항목만 삭제해(코드 변경 0줄) 함수가 고아로 남았고, 이후
`4f6bad7`에서 `clearAndBackfillCountLogs` 추출 때 미사용인 채로 함께 갱신됐다.
저장소 전 히스토리를 통틀어 호출처가 커밋된 적이 없다.

교훈: 커밋되지 않은 로컬 코드를 전제로 한 할 일 항목은 체크할 때 코드를 확인해야 한다.

## 남은 것

`db/* -> statistic/*` 간선은 0이 됐지만, **모듈 27개가 풀린다는 예측은 빗나갔다.**
`statistic/types`의 전이 의존자는 121 -> 93으로 줄었어도 저장 계층 타입이 `db/countLog/types`로 옮겨가
`openNoemaDB`(전이 의존자 108)를 통해 앱 전체에 닿으므로 124다. 통계 레코드 스키마로부터의 재컴파일
격리는 애초에 불가능했다. 실제로 얻은 것은 화면 상수·유틸로부터의 격리와 의존 방향의 단방향화다.
자세한 수치는 [의존성 병목](../../설계/의존성-병목.md) 1번 항목에 있다.

백필 경로 자체는 검증하지 못했다. `DB_VERSION`(11)을 올리지 않아 `oldVersion < 9` 분기가 실행되지 않고,
`rebuildCountLogs`도 제거해 런타임에서 백필을 부를 수단이 없다. 로직은 그대로 두고 import 경로만 바꿨다.

