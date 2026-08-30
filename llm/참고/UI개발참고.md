# UI 개발 참고

새 UI를 추가하기 전에 읽는 문서다. 이 프로젝트에서 pico와 CSS Module을 함께 쓸 때 반복해서 부딪힌 함정과, 이미 있는 공용 부품·관용 마크업을 한 곳에 모았다.
입력칸·키보드·포커스는 [입력-포커스참고](./입력-포커스참고.md), 라우트·쿼리·토스트는 [라우팅-쿼리참고](./라우팅-쿼리참고.md)에 있다. 각 항목의 출처는 `일지/`에 링크한다.

# pico 사용 전제

- `main.tsx`가 `@picocss/pico/css/pico.conditional.min.css`를 불러온다. 모든 pico 선택자가 `.pico` 하위로 스코프된다.
  `__root.tsx`의 `header`와 `main`에 `className="pico container"`가 붙어 있고, 포털로 바깥에 그리는 요소(토스트 등)는 `pico` 클래스를 **문자열로** 직접 병기해야 `--pico-*` 변수와 `article` 카드 스타일을 받는다.
- pico의 root font-size는 뷰포트 폭에 따라 100%~131.25%로 바뀐다. 크기 비율을 유지하려면 `em`이 아니라 `rem`으로 적는다. 고정 픽셀 사양(문장 입력기 최소 높이 256px 등)은 `px`로 두고, 폰트를 따라 커져야 하는 부분만 `rem`이다.
- Semantic 태그만으로 대부분 해결된다. `article` 카드, `table`, `dialog`, `nav`, `fieldset`, `mark`를 먼저 쓰고, CSS Module은 그 위에 얹는 보정에만 쓴다.

# specificity 함정 (가장 자주 터진다)

conditional 빌드는 selector 앞에 `.pico`가 붙어 specificity가 한 단계 높다. CSS Module의 클래스 하나(0-1-0)로는 pico 규칙을 못 이기는 경우가 많다.

| pico 규칙 | specificity | 증상 |
| --- | --- | --- |
| `.pico nav { justify-content: space-between }` | 0-1-1 | 네비게이터 버튼이 양끝으로 벌어짐 |
| `.pico input { font-family: inherit }`, `.pico textarea` | 0-1-1 | mono 폰트 지정이 무효, 공백 에코와 글자 폭이 어긋남 |
| `.pico h3` | 0-1-1 | 제목 클래스 하나로는 로드 순서에 운을 맡김 |
| `.pico [role=group] > * { flex: 1 1 auto }` | 0-2-0 | 버튼이 shrink되어 한국어 라벨이 세로로 꺾임 |
| `.pico [role=group]`의 `margin-inline`/`width: 100%` | 0-2-0 | `fit-content`·`margin: auto`가 안 먹음 |
| `.pico select`, `.pico fieldset`의 `width: 100%` + `margin-bottom: var(--pico-spacing)` | 0-1-1 | 인라인으로 놓으려 해도 한 줄을 다 차지 |
| `.pico button[type=submit]` | 0-2-1 | **속성 선택자는 클래스와 같은 자리를 차지한다.** `.actions .action`(0-2-0)이 진다 |
| `.pico ul li { list-style: square }` | 0-1-2 | `ul`에 건 `list-style: none`이 무효. 마커는 `li`에서 결정된다 |
| `.pico sub`의 `font-size: .75em` + `vertical-align: baseline` | 0-1-1 | `sub`이 아래첨자로 안 보임. `h1` 안이면 27px 굵은 글씨가 되어 두 번째 제목처럼 읽힌다 |
| `[role=group] input:focus { z-index: 2 }` | | 포커스 중 겹쳐 놓은 요소가 가려짐 |

대응 규칙:

- 루트 클래스를 `:global(.pico) .root`(0-2-0)로 승격하고, 자식은 `.root button`처럼 그 아래에 적는다. `PageNavigator.module.css`, `TypeFilterField.module.css`, `__root.module.css`가 이 형태다.
- 승격하면 그동안 pico에 지고 있던 값이 실제로 먹으므로, **화면에 보이던 크기**를 기준으로 다시 잡는다(네비게이터 버튼은 보이던 크기의 80%로 재설정했다).
- specificity 경쟁이 싫으면 pico가 건드리지 않는 속성을 쓴다. 버튼의 세로 꺾임은 `white-space: nowrap`으로, 그룹의 가운데 정렬은 감싸는 요소에 `justify-content: center`로 풀었다.
- 전역 기본값을 덮을 때는 `:where(.pico ul)`처럼 specificity를 0으로 만들어 어떤 저자 클래스에도 지게 한다(`global.css`). `.pico ul`(0-1-2)로 쓰면 이번엔 그것이 모듈 클래스를 이긴다.
- 제출 버튼만 full width인 pico 기본 모양은 나쁘지 않아 그대로 둔다. 이기려고 선택자를 꼬지 않는다.
- CSS 이론만으로 두 번 틀린 기록이 있다. 빌드 산출 CSS나 브라우저 `getComputedStyle`로 확인한다.

출처: [2026-07-22 WordWriter](../일지/2026-07-22-WordWriter-레이아웃-및-공백-에코-수정.md), [2026-07-22 bullet](../일지/2026-07-22-목록-bullet-제거를-전역화.md), [2026-07-22 문장 입력기](../일지/2026-07-22-문장-입력기와-개별-문장-페이지.md), [2026-07-23 네비게이터](../일지/2026-07-23-최근-목록-날짜-표기와-네비게이터-크기.md), [2026-07-29 탐색](../일지/2026-07-29-탐색-페이지.md), [2026-08-24 헤더 버전 표기](../일지/2026-08-24-헤더-버전-표기.md)

# 레이아웃 함정

- **flex 자식에 `min-width: 0`.** 없으면 Chart.js가 canvas에 박는 인라인 폭이 min-content가 되어 줄어들지 않는다. 줄임표 셀도 같다.
- **flex 컨테이너는 익명 텍스트 노드의 앞뒤 공백을 지운다.** 기호는 `white-space: pre`인 `span`에 담는다(`RelationExpression`).
- **표의 좁은 폭 대응은 `table-layout: fixed`를 쓰지 않는다.** 날짜 열 폭을 `em`으로 어림해야 하고 폰트가 바뀌면 어긋난다. auto 레이아웃에서 잘려도 되는 열에 `max-width: 0`, 온전해야 하는 열에 `width: 1%`, 셋 다 `overflow: hidden; text-overflow: ellipsis`. 576px 이하에서는 pico의 셀 좌우 여백(셀당 2rem)을 줄인다(`RecentTable.module.css`). 셀 안을 flex로 나눠 링크만 줄이는 패턴은 `RelationsTable.module.css`.
- **오버레이(공백 에코)를 입력칸과 1px도 어긋나지 않게 겹치려면** 양쪽에 `scrollbar-gutter: stable`과 `tab-size: 4`를 명시하고, pico가 `textarea`에 주는 `margin-bottom`을 wrapper로 옮긴다. 안 옮기면 에코 박스가 18px 길어져 다음 줄이 샌다. `␣` 글리프는 폰트에 없으면 폴백 폭이 달라 겹치므로, 실제 공백으로 폭을 잡고 `::before` 테두리로 상자를 그린다. 장식 오버레이에는 `aria-hidden="true"`.
- **`WordField`를 `[role=group]` 밖에 단독으로 놓으면 pico의 `input { margin-bottom: var(--pico-spacing) }`(0-2-1)이 살아 `.inputWrapper`(flex)가 입력칸보다 1rem 커지고 공백 에코가 아래로 밀린다.** 감싸는 요소에 여백을 주고 `input { margin-bottom: 0 }`으로 되돌린다(`document/DocumentWriter/TitleField.module.css`). 실측으로 input과 에코의 top·height가 같은지 확인한다.
  출처: [2026-08-30](../일지/2026-08-30-문서-제목-도입.md)
- **화면 bottom에 떠 있는 버튼 행은 `position: sticky; bottom: 0`으로 충분하다(`WriterActions.module.css`).** containing block(`form`)의 마지막 자식이면 폼 끝이 보일 때 제자리로 돌아오고 위에는 붙지 않는다. 떠 있을 때 본문이 비치지 않게 카드 배경색을 주고, 앞 형제의 `margin-bottom`은 음수 `margin-top` + 같은 `padding-top`으로 행 안에 흡수한다(자연 위치 좌표가 변하지 않는지 실측). z-index 층위: pico `[role=group] :focus` 2 < `WhitespaceEcho` 3 < 버튼 행 3(DOM 뒤) < `WordSuggestion` 4 < 토스트 10. 행을 4 이상으로 올리면 단어 페이지의 추천 목록을 가린다.
  출처: [2026-08-30](../일지/2026-08-30-수정삭제-버튼-행-sticky.md)
- **유형에 따라 높이가 바뀌는 영역은 한 덩어리로 묶어 `min-height` + 중앙 정렬을 한 번만 준다.** 두 영역에 각각 주면 여백이 겹쳐 한 문제로 읽히지 않는다. 기준값은 실측한다. `20rem`은 pico root font 때문에 400px이 됐다.
- **차트 4개를 한 행에**: `flex-wrap` + `flex: 1 1 14rem`, 미디어 쿼리 없음.
  출처: [2026-07-23 통계](../일지/2026-07-23-통계와-총-보유의-불일치-제거.md), [2026-08-16 통합 목록](../일지/2026-08-16-관계-히스토리-통합-페이지-relations.md), [2026-07-23 좁은 폭](../일지/2026-07-23-최근-목록-표의-좁은-폭-대응.md), [2026-07-22 문장 입력기](../일지/2026-07-22-문장-입력기와-개별-문장-페이지.md), [2026-07-29 탐색](../일지/2026-07-29-탐색-페이지.md)

# 관용 마크업

- **입력 + 버튼 한 줄**: `<fieldset role="group">` 안에 `input`/`select`와 `button`을 나란히 둔다. pico만으로 테두리가 붙은 한 덩어리가 된다.
  `QnaSearchForm`(검색어 + 찾기), `TypeFilterField`(select + x 뱃지), `BackupPanel`(내보내기 + 가져오기 `div[role=group]`), `GrowthChart`(select 둘).
  인라인 뱃지처럼 여러 개를 한 줄에 늘어놓으려면 감싸는 `.root`에 flex-wrap을 주고 `.badge, select { width: auto; margin: 0 }`로 100% 폭을 푼다.
- **버튼 토글 그룹**: `ChoiceGroup`(`role="group"` + `aria-pressed`, 비선택은 `secondary`). pico 버튼의 background transition 0.2초 도중에 찍은 스크린샷은 선택 상태가 틀려 보인다.
- **라디오/체크박스 목록**: `shared/RadioGroup`(`Option<T>[] | T[]`), `QuestionTypeSelector`(체크박스 배열 토글). 한 화면에 라디오 그룹이 둘이면 `name`을 달리 준다.
- **표 행을 링크로**: `RelationRow`(행 클릭으로 개별 관계 이동, `closest('a')`면 링크에 양보). 행 색조는 `getRowToneClassName`(`success`/`warning`/`error`, `shared/RowTone.module.css`). pico가 `td`에 배경을 주므로 `.tone td`에 `color-mix`로 칠한다.
- **배치 결과 색 규약**: 성공 초록(`success`), 중복 주황(`warning`), 실패 빨강(`error`). 라벨은 `relation/batch/getOutcomeLabel.ts`. 단어 추출·태그의 `중복`은 "단어가 이미 있다"는 뜻이라 배치 모드의 관계 중복과 의미가 다르다(`tag/getTagOutcomeLabel.ts`).
- **부분 강조**: `shared/HighlightedText`(`text.split(keyword)` 사이에 `mark`).
- **결과 대화상자**: `shared/ResultDialog`(`dialog open` + `article` + 값/결과 표). 결과 0건이면 띄우지 않는다.
- **페이지 단위 목록**: 커서 페이징은 `recent/RecentListPage/RecentListSection`(기간 폼 + 표 + `PageNavigator`, `RecentFilter`로 행 필터), 메모리 페이징은 `shared/PagedSection`(`header`로 제목 아래에 컨트롤을 끼우고 `resetKey`로 1페이지 복귀).
- **쌍 관계 표/페이지**: `relation/PairTable`(열 주입), `relation/PairRelationPage`(라벨된 참조 줄 주입). 문장 추출·단어 추출·태그가 공유한다.
- **단어 입력 + 자동완성**: `WordField` + `WordSuggestion` + `useSuggestionFocus`. 규칙은 [입력-포커스참고](./입력-포커스참고.md).
- **토스트**: mutation의 `meta.successMessage`와 `MutationCache.onError`가 자동으로 띄운다. 컴포넌트에서 직접 성공/실패 문구를 그리지 않는다.
- **메타 정보**: `meta/MetaFields`(`{ label, value }[]`, `label` + `input[readOnly]` 그리드). 드래그 복사가 되어 `p`보다 낫다.
- **최근 목록 줄**: `recent/RecentLines`(`article` + `h2` + `ul` + 줄임표). 길이 제한은 JS가 아니라 `text-overflow: ellipsis`다.

# 공용 컴포넌트 위치

`shared/`에는 `HighlightedText`, `PagedSection`, `RadioGroup`, `ResultDialog`, `TypeFilterField`, `getRowToneClassName`, `RowTone.module.css`, `types.ts`(`Option<T>`)가 있다.
`utils/`에는 `focusFirstElement`, `focusNextElement`, `consts.ts`(`FOCUSABLE_SELECTOR`), `useThrottledValue`, `getErrorMessage`, `sliceSafely`, `computeCartesianProduct`가 있다.
`writer/`에는 `WhitespaceEcho`, `SourceField`, `WriterActions`, `insertTabIfPressed`, `useWriterForm`이 있다.
`Badge`/`Chip` 같은 범용 뱃지 컴포넌트는 없다. 뱃지 모양이 필요하면 `fieldset[role=group]` 조합을 쓴다.
