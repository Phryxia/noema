# UI 개발 참고

새 UI를 추가하기 전에 읽는 문서다. 이 프로젝트에서 pico와 CSS Module을 함께 쓸 때 반복해서 부딪힌 함정과,
이미 있는 공용 부품·관용 마크업을 한 곳에 모았다. 각 항목의 출처는 [화면 구현 기록](./history/구현/화면.md)에 있다.

# pico 사용 전제

- `main.tsx`가 `@picocss/pico/css/pico.conditional.min.css`를 불러온다. 모든 pico 선택자가 `.pico` 하위로 스코프된다.
  `__root.tsx`의 `header`와 `main`에 `className="pico container"`가 붙어 있고, 포털로 바깥에 그리는 요소(토스트 등)는 `pico` 클래스를 **문자열로** 직접 병기해야 `--pico-*` 변수와 `article` 카드 스타일을 받는다.
- pico의 root font-size는 뷰포트 폭에 따라 100%~131.25%로 바뀐다. 크기 비율을 유지하려면 `em`이 아니라 `rem`으로 적는다.
- Semantic 태그만으로 대부분 해결된다. `article` 카드, `table`, `dialog`, `nav`, `fieldset`, `mark`를 먼저 쓰고, CSS Module은 그 위에 얹는 보정에만 쓴다.

# specificity 함정 (가장 자주 터진다)

conditional 빌드는 selector 앞에 `.pico`가 붙어 specificity가 한 단계 높다. CSS Module의 클래스 하나(0-1-0)로는 pico 규칙을 못 이기는 경우가 많다.

| pico 규칙 | specificity | 증상 |
| --- | --- | --- |
| `.pico nav { justify-content: space-between }` | 0-1-1 | 네비게이터 버튼이 양끝으로 벌어짐 |
| `.pico input { font-family: inherit }` | 0-1-1 | mono 폰트 지정이 무효 |
| `.pico h3` | 0-1-1 | 제목 클래스 하나로는 로드 순서에 운을 맡김 |
| `.pico [role=group] > * { flex: 1 1 auto }` | 0-2-0 | 버튼이 shrink되어 한국어 라벨이 세로로 꺾임 |
| `.pico [role=group]`의 `margin-inline`/`width: 100%` | 0-2-0 | `fit-content`·`margin: auto`가 안 먹음 |
| `.pico select`, `.pico fieldset`의 `width: 100%` + `margin-bottom: var(--pico-spacing)` | 0-1-1 | 인라인으로 놓으려 해도 한 줄을 다 차지 |
| `[role=group] input:focus { z-index: 2 }` | | 포커스 중 겹쳐 놓은 요소가 가려짐 |

대응 규칙:

- 루트 클래스를 `:global(.pico) .root`(0-2-0)로 승격하고, 자식은 `.root button`처럼 그 아래에 적는다. `PageNavigator.module.css`, `TypeFilterField.module.css`가 이 형태다.
- 승격하면 그동안 pico에 지고 있던 값이 실제로 먹으므로, **화면에 보이던 크기**를 기준으로 다시 잡는다(네비게이터 버튼은 보이던 크기의 80%로 재설정했다).
- specificity 경쟁이 싫으면 pico가 건드리지 않는 속성을 쓴다. 버튼의 세로 꺾임은 `white-space: nowrap`으로, 그룹의 가운데 정렬은 감싸는 요소에 `justify-content: center`로 풀었다.
- 전역 기본값을 덮을 때는 `:where(.pico ul)`처럼 specificity를 0으로 만들어 어떤 저자 클래스에도 지게 한다(`global.css`).
- CSS 이론만으로 두 번 틀린 기록이 있다. 빌드 산출 CSS나 브라우저 `getComputedStyle`로 확인한다.

# 관용 마크업

- **입력 + 버튼 한 줄**: `<fieldset role="group">` 안에 `input`/`select`와 `button`을 나란히 둔다. pico만으로 테두리가 붙은 한 덩어리가 된다.
  `QnaSearchForm`(검색어 + 찾기), `TypeFilterField`(select + x 뱃지), `BackupPanel`(내보내기 + 가져오기 `div[role=group]`), `GrowthChart`(select 둘).
  인라인 뱃지처럼 여러 개를 한 줄에 늘어놓으려면 감싸는 `.root`에 flex-wrap을 주고 `.badge, select { width: auto; margin: 0 }`로 100% 폭을 푼다.
- **버튼 토글 그룹**: `ChoiceGroup`(`role="group"` + `aria-pressed`, 비선택은 `secondary`).
- **라디오/체크박스 목록**: `shared/RadioGroup`(`Option<T>[] | T[]`), `QuestionTypeSelector`(체크박스 배열 토글).
- **표 행을 링크로**: `RelationRow`(행 클릭으로 개별 관계 이동), 행 색조는 `getRowToneClassName`(`success`/`warning`/`error`, `RowTone.module.css`).
- **부분 강조**: `shared/HighlightedText`(`text.split(keyword)` 사이에 `mark`).
- **결과 대화상자**: `shared/ResultDialog`(`dialog open` + `article` + 단어/결과 표).
- **페이지 단위 목록**: 커서 페이징은 `recent/RecentListPage/RecentListSection`(기간 폼 + 표 + `PageNavigator`, `RecentFilter`로 행 필터), 메모리 페이징은 `shared/PagedSection`(`header`로 제목 아래에 컨트롤을 끼우고 `resetKey`로 1페이지 복귀).
- **단어 입력 + 자동완성**: `WordField` + `WordSuggestion` + `useSuggestionFocus`. `WordSuggestion`은 absolute(z-index 4)라 바로 아래 요소를 덮는 것이 정상이며, 그 요소에 `position`/`z-index`를 주면 안 된다.
- **토스트**: mutation의 `meta.successMessage`와 `MutationCache.onError`가 자동으로 띄운다. 컴포넌트에서 직접 성공/실패 문구를 그리지 않는다.
- **픽셀 정밀 배치**: 좁은 셀에서 줄임표로 자르는 표는 `RelationsTable.module.css`/`RecentTable.module.css`의 flex 셀 패턴을 따른다.

# 공용 컴포넌트 위치

`shared/`에는 `HighlightedText`, `PagedSection`, `RadioGroup`, `ResultDialog`, `TypeFilterField`, `getRowToneClassName`, `types.ts`(`Option<T>`)가 있다.
`Badge`/`Chip` 같은 범용 뱃지 컴포넌트는 없다. 뱃지 모양이 필요하면 `fieldset[role=group]` 조합을 쓴다.

# 포커스와 리마운트

- 값이 바뀌는 `select`/`input`에 값 자체를 `key`로 주면 바뀔 때마다 리마운트되어 포커스를 잃는다. 위치 기반 `key={index}`나 고정 키를 쓴다.
- 앞에 요소가 끼어드는 배열에서 키 없는 자식은 index 키가 밀려 리마운트된다. 라벨·추가용 `select`처럼 위치가 변하는 고정 요소에는 명시적 키를 둔다.
- 폼 전체에 `onFocus`/`onBlur`를 걸면 버튼 mousedown에 자동완성이 열려 click을 가로챈다. 포커스 감지 범위는 입력칸과 추천 목록만 감싸는 `div`로 좁힌다.
- 초안 상태(`useState`)를 URL 등 외부 값과 동기화할 때는 `useEffect(() => setDraft(value), [key])`(`QnaSearchForm`, `useRelationTypeDraft`) 또는 `key`로 리마운트(`RangeSearchForm`)한다. 리마운트는 다른 입력칸의 초안까지 날리므로 범위를 확인한다.
