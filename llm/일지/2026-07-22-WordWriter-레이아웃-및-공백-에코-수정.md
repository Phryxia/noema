# 2026-07-22 WordWriter 레이아웃 및 공백 에코 수정

## 문제

WordWriter에서 input이 좁게, 저장 button이 넓게 나오다가, 수정 후에는 "저장"이 세로로 꺾이고 높이가 어긋났다. 공백 표시용 `␣` 글리프는 뒤 글자와 겹쳤다.

## 해결

핵심 원인은 이 프로젝트가 `pico.conditional.min.css`를 쓴다는 점이다. 모든 pico 선택자가 `.pico` 하위로 스코프되어 specificity가 한 단계씩 높아지므로, CSS Module의 한 단계짜리 클래스 선택자로는 pico 규칙을 못 이기는 경우가 많다.

- 레이아웃은 커스텀 flex 대신 pico의 `fieldset[role=group]` 패턴으로 교체했다. input+button이 결합된 한 줄이 pico 규칙만으로 나온다.
- "저장" 세로 출력: `.pico [role=group] > *`(0-2-0)의 `flex: 1 1 auto`가 `.group button`(0-1-1)의 `flex-shrink: 0`을 이겼다. 한국어는 글자 사이 줄바꿈이 허용되어 min-content가 한 글자 폭이라 shrink 시 세로가 된다. specificity 경쟁 대신 pico가 안 건드리는 `white-space: nowrap`으로 해결했다.
- input 폰트: `.pico input { font-family: inherit }`(0-1-1)가 `.input`(0-1-0)의 mono 지정을 무효화해 echo(mono)와 글자 폭이 어긋났다. `.inputWrapper .input`(0-2-0)으로 승격했다.
- `␣` 글리프 겹침: 폰트에 U+2423이 없으면 폴백 글리프의 폭이 공백과 달라진다. 실제 공백 문자로 폭을 잡고 `::before` 테두리로 열린 상자를 그려 글리프 의존을 제거했다.
- 마커 미표시: pico group의 `input:focus { z-index: 2 }`가 포커스 중 echo를 가렸다. `.echo`에 `z-index: 3`을 부여했다.

검증은 playwright(scratchpad에 설치)로 실제 렌더링을 스크린샷·좌표 측정하여 수행했다. CSS 이론만으로 두 번 틀렸고, 브라우저로 본 뒤에야 원인이 확정됐다.

