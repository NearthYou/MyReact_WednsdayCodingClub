# VDOM & Diff 프로젝트 협업 명세서

## 1. 문서 목적
이 문서는 3명이 동일한 파일 구조와 공통 규약 아래에서 각각 Codex를 활용해 구현하더라도,
코드 충돌과 인터페이스 불일치를 최소화하기 위한 **단일 기준 문서**입니다.

이 문서에서 정한 내용은 다음 항목에 대해 **반드시 동일하게 유지**합니다.

- 폴더 구조
- 파일명
- export 함수명
- Virtual DOM 자료구조
- Patch 자료구조
- History 자료구조
- DOM/VDOM 변환 규칙
- Diff 대상 범위
- Git 협업 규칙

---

## 2. 프로젝트 목표
브라우저의 실제 DOM을 읽어 Virtual DOM으로 변환하고,
이전 Virtual DOM과 새로운 Virtual DOM을 비교하여 변경점만 실제 DOM에 반영하는 미니 렌더러를 구현한다.

추가로 다음을 지원해야 한다.

- 실제 영역 / 테스트 영역 UI
- Patch 버튼으로 부분 업데이트
- Undo / Redo
- State History 관리
- Patch 로그 및 디버그 정보 표시
- 다양한 HTML 태그에 대한 테스트 가능

기술 스택은 다음으로 고정한다.

- HTML
- CSS
- JavaScript (Vanilla)
- 서버 없음
- 정적 배포 가능 구조 (Vercel 배포 가능)

---

## 3. 역할 분담

### Person A - VDOM / DOM 변환 담당
책임 범위:
- DOM → VDOM 변환
- VDOM → DOM 렌더링
- 노드 스키마 고정
- 속성 추출 규칙 구현
- 공백 텍스트 처리 규칙 구현
- DOM/렌더 계층 수동 스모크 테스트 정리

구현 파일:
- `src/core/vdom.js`
- `src/core/render.js`
- 필요 시 `src/core/dom-utils.js`

주의:
- Diff에서 기대하는 VDOM 형식을 절대 변경하지 않는다.
- tag, props, children, text 필드명은 문서와 동일해야 한다.
- `cloneVNode`는 순수 함수지만 v1에서는 자동 테스트 의무 대상이 아니다.

---

### Person B - Diff / Patch 엔진 담당
책임 범위:
- old VDOM vs new VDOM 비교
- patch 생성
- patch 실제 DOM 적용
- props diff, children diff 규칙 구현
- patch path 탐색 유틸 구현
- diff/path-utils 단위 테스트 작성

구현 파일:
- `src/core/diff.js`
- `src/core/patch.js`
- 필요 시 `src/core/path-utils.js`
- `tests/unit/core/diff.test.js`
- `tests/unit/core/path-utils.test.js`

주의:
- patch 타입 이름을 변경하지 않는다.
- Path 규칙은 반드시 배열 인덱스 기반으로 유지한다.
- children diff는 index 기반 비교로 제한한다.

---

### Person C - UI / History / 통합 담당
책임 범위:
- 실제 영역 / 테스트 영역 UI
- 버튼(Patch / Undo / Redo / Reset) 이벤트 연결
- History 저장 및 이동
- 초기 샘플 로드
- 디버그 패널, patch 로그, 상태 표시
- history 단위 테스트 작성
- `package.json` 테스트 스크립트 구성
- GitHub Actions CI 워크플로 구성
- README 초안 및 데모 시나리오 정리

구현 파일:
- `src/app.js`
- `src/state/history.js`
- `src/ui/bindings.js`
- `src/ui/debug-panel.js`
- `src/styles/main.css`
- `tests/unit/state/history.test.js`
- `package.json`
- `.github/workflows/ci.yml`

주의:
- core 계층의 exported function 시그니처를 임의 수정하지 않는다.
- UI 코드는 core 계층을 호출만 하며 로직을 중복 구현하지 않는다.

---

## 4. 공통 개발 원칙

1. **파일 구조와 함수명은 본 문서 우선**
2. 각자 자신의 담당 파일 외에는 수정하지 않는다.
3. 공통 인터페이스 수정이 필요하면 먼저 팀 합의 후 일괄 반영한다.
4. Codex에 요청할 때도 반드시 이 명세서를 함께 제공한다.
5. `innerHTML`로 전체 영역을 매번 갈아엎지 않는다. Patch 적용이 우선이다.
6. children 비교는 **index 기반**으로만 구현한다.
7. 이벤트 핸들러 diff는 이번 범위에서 제외한다.
8. 브라우저에서 바로 실행 가능해야 하며 빌드 도구 의존성 없이 동작 가능해야 한다.
9. 순수 로직 계층은 Node 내장 `node:test`와 `assert/strict`로 자동 테스트한다.
10. DOM/UI 의존 계층은 별도 DOM 테스트 환경 도입 전까지 수동 스모크 테스트로 검증한다.
11. 자동화 범위에 속한 로직을 수정하면 관련 단위 테스트도 반드시 함께 수정한다.

---

## 5. 고정 폴더 구조
아래 구조를 **모든 팀원이 동일하게 생성**해야 한다.

```text
project-root/
├─ package.json
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ index.html
├─ README.md
├─ assets/
│  └─ sample-html.js
├─ src/
│  ├─ app.js
│  ├─ core/
│  │  ├─ vdom.js
│  │  ├─ render.js
│  │  ├─ diff.js
│  │  ├─ patch.js
│  │  ├─ dom-utils.js
│  │  └─ path-utils.js
│  ├─ state/
│  │  └─ history.js
│  ├─ ui/
│  │  ├─ bindings.js
│  │  └─ debug-panel.js
│  └─ styles/
│     └─ main.css
├─ tests/
│  └─ unit/
│     ├─ core/
│     │  └─ *.test.js
│     └─ state/
│        └─ *.test.js
└─ docs/
   ├─ TEAM_SPEC.md
   ├─ AGENT_RULES.md
   ├─ AGENT_PERSON_A.md
   ├─ AGENT_PERSON_B.md
   ├─ AGENT_PERSON_C.md
   └─ INTEGRATION_LOG.md
```

### 파일 생성 규칙
- 파일명 변경 금지
- 폴더명 변경 금지
- ESM 사용: `type="module"`
- import 경로는 상대경로 사용
- 자동 테스트 파일은 `tests/unit/**/*.test.js` 아래에만 추가
- CI는 GitHub Actions에서 Node 22로 `npm test`를 실행

---

## 6. HTML 구조 고정 규약
`index.html`의 주요 DOM id는 아래 이름으로 고정한다.

```html
<div id="app">
  <header class="topbar">
    <h1>Mini Virtual DOM Playground</h1>
  </header>

  <section class="controls">
    <button id="patch-btn">Patch</button>
    <button id="undo-btn">Undo</button>
    <button id="redo-btn">Redo</button>
    <button id="reset-btn">Reset</button>
  </section>

  <main class="workspace">
    <section class="panel">
      <h2>실제 영역</h2>
      <div id="real-root" class="render-root"></div>
    </section>

    <section class="panel">
      <h2>테스트 영역</h2>
      <div id="test-root" class="render-root" contenteditable="true"></div>
    </section>
  </main>

  <section class="debug-section">
    <div>
      <h2>Patch Log</h2>
      <pre id="patch-log"></pre>
    </div>
    <div>
      <h2>Current VDOM</h2>
      <pre id="vdom-log"></pre>
    </div>
    <div>
      <h2>History</h2>
      <pre id="history-log"></pre>
    </div>
  </section>
</div>
```

### 주의
- id 이름 변경 금지
- 버튼 이벤트 연결은 Person C 담당
- 렌더 대상은 `#real-root`, `#test-root`

---

## 7. Virtual DOM 스키마 고정
모든 로직은 아래 스키마를 기준으로 구현한다.

### 7.1 ElementVNode
```js
{
  nodeType: "element",
  tag: "div",
  props: {
    id: "box",
    class: "card",
    style: "color:red"
  },
  children: [/* VNode[] */]
}
```

### 7.2 TextVNode
```js
{
  nodeType: "text",
  text: "Hello World"
}
```

### 7.3 공통 규칙
- `nodeType` 값은 `"element" | "text"` 두 종류만 허용
- element 노드는 반드시 `tag`, `props`, `children` 필드 보유
- text 노드는 반드시 `text` 필드 보유
- `props`는 순수 객체
- `children`은 항상 배열
- `undefined`, `null` children 금지
- 주석 노드는 무시
- 의미 없는 공백 텍스트 노드는 제거

### 7.4 의미 없는 공백 텍스트 판정 규칙
다음 텍스트 노드는 무시한다.
- `"\n"`
- `"    "`
- trim 결과가 빈 문자열인 텍스트 노드

단, 다음은 유지한다.
- `"Hello "`
- `" Hello"`
- 중간 텍스트 의미가 있는 문자열

---

## 8. DOM → VDOM 변환 규칙
`src/core/vdom.js`

### export 함수
```js
export function domToVNode(domNode) {}
export function domChildrenToVNodes(domNode) {}
export function cloneVNode(vNode) {}
```

### 동작 규칙
1. 텍스트 노드면 TextVNode 반환
2. 요소 노드면 ElementVNode 반환
3. `attributes`를 순회해 `props` 생성
4. `childNodes`를 순회해 `children` 생성
5. 의미 없는 공백 텍스트는 제외
6. 주석 노드는 제외

### 지원 속성 범위
- `id`
- `class`
- `style`
- `title`
- `data-*`
- 일반 문자열 attribute
- boolean attribute는 존재 시 `""` 문자열로 저장

예:
```html
<button disabled>Go</button>
```
→
```js
props: { disabled: "" }
```

---

## 9. VDOM → DOM 렌더 규칙
`src/core/render.js`

### export 함수
```js
export function createDomFromVNode(vNode) {}
export function renderVNode(vNode, container) {}
export function setDomProps(element, props = {}) {}
```

### 동작 규칙
- text node → `document.createTextNode`
- element node → `document.createElement(tag)`
- props 설정 후 children 재귀 렌더링
- `renderVNode(vNode, container)`는 container 내용을 비우고 초기 렌더링할 때만 사용
- patch 단계에서는 `renderVNode` 대신 patch 함수 사용

### props 반영 규칙
- 문자열 attribute는 `setAttribute`
- 값 제거는 `removeAttribute`
- style은 문자열 그대로 유지
- 이벤트 핸들러 속성(onclick 등)은 이번 범위에서 무시

---

## 10. Patch 스키마 고정
모든 patch는 아래 타입 중 하나여야 한다.

### 10.1 CREATE
```js
{
  type: "CREATE",
  path: [0, 1],
  node: { /* VNode */ }
}
```

### 10.2 REMOVE
```js
{
  type: "REMOVE",
  path: [2]
}
```

### 10.3 REPLACE
```js
{
  type: "REPLACE",
  path: [1, 0],
  node: { /* VNode */ }
}
```

### 10.4 TEXT
```js
{
  type: "TEXT",
  path: [0, 0],
  text: "new text"
}
```

### 10.5 PROPS
```js
{
  type: "PROPS",
  path: [1],
  props: {
    set: {
      class: "active",
      title: "hello"
    },
    remove: ["style"]
  }
}
```

### path 규칙
- path는 루트 기준 자식 인덱스 배열
- 루트 자신은 `[]`
- `[]`는 루트 교체/루트 props 수정 가능
- 예: `[1, 0]` = 루트의 두 번째 자식의 첫 번째 자식

---

## 11. Diff 규칙 고정
`src/core/diff.js`

### export 함수
```js
export function diff(oldVNode, newVNode, path = []) {}
export function diffProps(oldProps = {}, newProps = {}) {}
export function diffChildren(oldChildren = [], newChildren = [], path = []) {}
```

### 처리해야 할 핵심 5가지 케이스
1. old 없음, new 있음 → CREATE
2. old 있음, new 없음 → REMOVE
3. nodeType 다름 또는 tag 다름 → REPLACE
4. 둘 다 text node이고 text 다름 → TEXT
5. 같은 element node인데 props/children 다름 → PROPS + children diff

### children diff 방식
- **반드시 index 기반 비교**
- key 기반 reconciliation 구현 금지
- reorder 최적화 구현 금지
- 최대 길이 기준으로 순회

예:
```js
const max = Math.max(oldChildren.length, newChildren.length);
for (let i = 0; i < max; i++) {
  // diff(oldChildren[i], newChildren[i], [...path, i])
}
```

### diff 결과
- return 값은 patch 배열
- depth-first 순회 결과로 반환
- patch 순서는 applyPatch에서 처리 가능한 순서여야 한다.

---

## 12. Patch 적용 규칙
`src/core/patch.js`

### export 함수
```js
export function applyPatches(rootElement, patches = []) {}
export function applyPatch(rootElement, patch) {}
export function getNodeByPath(rootElement, path = []) {}
export function getParentNodeByPath(rootElement, path = []) {}
```

### apply 규칙
- REMOVE는 자식 삭제이므로 parent 탐색 필요
- CREATE는 parent 탐색 후 지정 인덱스 위치에 삽입
- REPLACE는 대상 노드를 새 DOM으로 교체
- TEXT는 대상 text node의 `nodeValue` 변경
- PROPS는 대상 element에 set/remove 반영

### patch 적용 순서 권장
1. 깊은 노드부터 REMOVE 처리
2. REPLACE
3. TEXT
4. PROPS
5. CREATE

또는 `applyPatches` 내부에서 patch 타입별로 정렬해도 된다.
단, 동작이 안정적이면 구현 방식은 자유다.

---

## 13. History 규격 고정
`src/state/history.js`

### export 함수
```js
export function createHistory(initialVNode) {}
export function pushHistory(historyState, vNode) {}
export function undoHistory(historyState) {}
export function redoHistory(historyState) {}
export function getCurrentHistoryVNode(historyState) {}
```

### historyState 구조
```js
{
  stack: [/* VNode snapshots */],
  index: 0
}
```

### 규칙
- 초기 상태는 반드시 `stack[0]`
- push 시 현재 index 뒤의 redo 이력은 삭제
- undo 가능 조건: `index > 0`
- redo 가능 조건: `index < stack.length - 1`
- 저장 시 deep clone 사용

---

## 14. App 통합 흐름 규약
`src/app.js`

### export 함수
```js
export function initApp() {}
```

### 초기화 순서
1. 샘플 HTML 로드
2. 실제 영역 DOM 생성
3. 실제 영역 DOM → oldVNode 변환
4. oldVNode로 테스트 영역 렌더링
5. history 초기화
6. 버튼 이벤트 연결
7. 디버그 패널 초기 상태 반영

### Patch 버튼 동작
1. `#test-root` 현재 DOM 읽기
2. `newVNode = domToVNode(testRoot)`가 아니라, testRoot의 child 구조를 기준으로 루트 일관성을 유지하도록 처리
3. `patches = diff(currentVNode, newVNode)`
4. `applyPatches(realRoot, patches)`
5. `currentVNode = cloneVNode(newVNode)`
6. history push
7. test 영역을 currentVNode 기준으로 재동기화
8. debug panel 업데이트

### Undo 버튼 동작
1. history undo
2. currentVNode 교체
3. realRoot 전체 렌더
4. testRoot 전체 렌더
5. debug panel 업데이트

### Redo 버튼 동작
1. history redo
2. currentVNode 교체
3. realRoot 전체 렌더
4. testRoot 전체 렌더
5. debug panel 업데이트

### Reset 버튼 동작
1. 초기 VDOM으로 되돌림
2. history 초기화 또는 새로 생성
3. 두 영역 전체 렌더
4. debug panel 업데이트

---

## 15. 샘플 HTML 규약
`assets/sample-html.js`

### export 상수
```js
export const SAMPLE_HTML = `
<div class="card">
  <h1>Mini Virtual DOM</h1>
  <p data-role="description">Edit the test area and patch the real area.</p>
  <ul>
    <li>Diff text</li>
    <li>Diff props</li>
    <li>Add and remove nodes</li>
  </ul>
  <button title="sample button">Patch me</button>
</div>
`;
```

### 주의
- 모든 팀원이 동일한 샘플 사용
- 발표 중 안정적 데모를 위해 너무 복잡한 샘플 금지

---

## 16. 디버그 패널 규약
`src/ui/debug-panel.js`

### export 함수
```js
export function updatePatchLog(patches = []) {}
export function updateVNodeLog(vNode) {}
export function updateHistoryLog(historyState) {}
export function updateAllDebugPanels({ patches, vNode, historyState }) {}
```

### 출력 형식
- 사람이 읽기 쉬운 `JSON.stringify(value, null, 2)` 기반
- patch 없으면 `[]`
- history는 stack length와 current index를 함께 표시

---

## 17. UI 바인딩 규약
`src/ui/bindings.js`

### export 함수
```js
export function bindControls(handlers) {}
export function setButtonState({ canUndo, canRedo }) {}
```

### handlers 구조
```js
{
  onPatch: () => {},
  onUndo: () => {},
  onRedo: () => {},
  onReset: () => {}
}
```

---

## 18. 금지 사항
아래는 구현 금지 또는 이번 범위 제외 사항이다.

- React, Vue 등 프레임워크 사용
- TypeScript 도입
- 서버 구현
- key 기반 diff
- 이벤트 핸들러 diff
- HTML parser 라이브러리 도입
- 전체 패치 대신 매번 `realRoot.innerHTML = ...` 방식으로 전체 갈아엎기
- 팀원마다 다른 파일 구조 사용
- export 이름 임의 변경

---

## 19. 구현 우선순위

### 1차 필수
- DOM → VDOM
- VDOM → DOM
- diff
- patch
- Patch 버튼 동작
- Undo / Redo

### 2차 권장
- Reset 버튼
- debug panel
- button disable 처리
- patch 안정화

### 3차 여유 있으면
- localStorage 저장
- patch 하이라이트
- 성능 로그

---

## 20. 팀별 상세 할 일 목록

### Person A 할 일
- [ ] `domToVNode` 구현
- [ ] `domChildrenToVNodes` 구현
- [ ] `cloneVNode` 구현
- [ ] `createDomFromVNode` 구현
- [ ] `renderVNode` 구현
- [ ] `setDomProps` 구현
- [ ] 공백 텍스트 필터링 수동 스모크 테스트 정리
- [ ] 샘플 HTML이 VDOM으로 정확히 변환되는지 확인

### Person B 할 일
- [ ] `diff` 구현
- [ ] `diffProps` 구현
- [ ] `diffChildren` 구현
- [ ] `getNodeByPath` 구현
- [ ] `getParentNodeByPath` 구현
- [ ] `applyPatch` 구현
- [ ] `applyPatches` 구현
- [ ] `tests/unit/core/diff.test.js` 작성
- [ ] `tests/unit/core/path-utils.test.js` 작성
- [ ] 핵심 diff 케이스 자동 테스트

### Person C 할 일
- [ ] `initApp` 구현
- [ ] 버튼 이벤트 연결
- [ ] history 모듈 구현
- [ ] `tests/unit/state/history.test.js` 작성
- [ ] `package.json` 테스트 스크립트 구성
- [ ] `.github/workflows/ci.yml` 구성
- [ ] 디버그 패널 구현
- [ ] undo/redo 버튼 상태 반영
- [ ] 초기 샘플 로드
- [ ] README 초안 작성
- [ ] README의 테스트 및 CI 섹션 작성
- [ ] 데모 시나리오 정리

---

## 21. 통합 전 체크리스트
merge 전 반드시 아래를 점검한다.

### 공통
- [ ] 파일 구조가 문서와 동일한가
- [ ] export 함수명이 문서와 동일한가
- [ ] import 경로가 깨지지 않는가
- [ ] VDOM 키 이름이 동일한가
- [ ] patch 타입 이름이 동일한가
- [ ] `package.json`과 `.github/workflows/ci.yml`이 존재하는가
- [ ] `npm test`가 통과하는가

### 기능
- [ ] text 변경 반영
- [ ] 속성 변경 반영
- [ ] 노드 추가 반영
- [ ] 노드 삭제 반영
- [ ] 태그 교체 반영
- [ ] undo 작동
- [ ] redo 작동
- [ ] undo 후 새 patch 시 redo 이력 삭제
- [ ] DOM/UI 수동 스모크 테스트 항목이 정리되어 있는가

---

## 22. 테스트 및 CI 명세

### 22.1 자동 테스트 정책
- 자동화 범위는 순수 로직 계층으로 제한한다.
- 테스트 러너는 Node 내장 `node:test`와 `assert/strict`만 사용한다.
- 테스트 파일 위치는 `tests/unit/**/*.test.js`로 고정한다.
- 자동화 대상:
  - `diff`, `diffProps`, `diffChildren`
  - `createHistory`, `pushHistory`, `undoHistory`, `redoHistory`, `getCurrentHistoryVNode`
  - `isRootPath`
  - 필요 시 `cloneVNode`
- 이번 CI에서 제외하는 대상:
  - `domToVNode`, `domChildrenToVNodes`
  - `createDomFromVNode`, `renderVNode`
  - `applyPatch`, `applyPatches`
  - `bindControls`, `initApp`, debug panel 갱신 로직
- 자동화 범위에 속한 로직을 구현하거나 수정하면 관련 단위 테스트도 반드시 함께 추가하거나 수정한다.

### 22.2 자동 테스트 필수 케이스
1. 텍스트 변경
```html
<p>Hello</p> -> <p>Hello world</p>
```

2. 속성 변경
```html
<button class="a">Go</button> -> <button class="b">Go</button>
```

3. 노드 추가
```html
<ul><li>A</li></ul> -> <ul><li>A</li><li>B</li></ul>
```

4. 노드 삭제
```html
<ul><li>A</li><li>B</li></ul> -> <ul><li>A</li></ul>
```

5. 태그 교체
```html
<p>Hello</p> -> <h1>Hello</h1>
```

6. 중첩 구조 path 탐색
```html
<div><section><p>A</p></section></div>
```
에서 `p` 텍스트 수정과 경로 탐색 확인

7. 다중 변경
- 텍스트 수정 + props 변경 + 노드 추가 동시에 발생

8. History push / undo / redo
- snapshot 저장, 현재 index 이동, `getCurrentHistoryVNode` 반환 확인

9. Redo 폐기
- undo 후 새 history push 시 redo 이력 삭제 확인

10. Root path 판별
- `[]`만 루트로 판단하고 나머지 path는 false인지 확인

### 22.3 수동 스모크 테스트
- 초기 샘플 렌더링 확인
- Patch 버튼 클릭 시 실제 영역 반영 확인
- Undo / Redo UI 흐름 확인
- patch 후 테스트 영역 재동기화 확인
- debug panel 갱신 확인
- 의미 없는 공백 텍스트 노드가 과도한 변경을 만들지 않는지 확인

### 22.4 CI 규약
- 루트 `package.json`에는 `test`, `test:unit`, `ci` 스크립트를 둔다.
- `npm test`는 `tests/unit/**/*.test.js`를 실행한다.
- `.github/workflows/ci.yml`은 `push`와 `pull_request`마다 Node 22에서 `npm test`를 실행한다.

---

## 23. Git 협업 규칙

### 브랜치 규칙
- `main`: 최종 통합 브랜치
- `feat/vdom-personA`
- `feat/diff-personB`
- `feat/app-personC`

### 커밋 메시지 예시
- `feat(vdom): implement dom to vnode conversion`
- `feat(diff): add text and props diff`
- `feat(app): wire patch undo redo controls`
- `fix(patch): handle remove path ordering`

### 병합 순서
1. Person A 브랜치 병합
2. Person B 브랜치 병합
3. Person C 브랜치 병합
4. 충돌 있으면 인터페이스 기준은 본 문서 우선

---

## 24. Codex 프롬프트 사용 규칙
각자 Codex에게 요청할 때 반드시 아래 공통 문장을 포함한다.

### 공통 프롬프트 머리말
```text
아래 명세서를 절대 기준으로 삼아 구현해줘.
파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
담당 범위와 문서에 명시된 테스트/CI 설정 파일만 수정하고 다른 파일은 수정하지 마.
Vanilla JavaScript ESM 기준으로 작성해줘.

이번 작업에는 자동 테스트와 CI 구축도 포함해.
새 테스트 패키지는 추가하지 말고 Node 내장 `node:test`와 `assert/strict`만 사용해.
자동화 범위는 순수 로직 계층으로 제한해.
우선 `diff`, `diffProps`, `diffChildren`, `createHistory`, `pushHistory`, `undoHistory`, `redoHistory`, `getCurrentHistoryVNode`, `isRootPath`를 테스트해.
필요하면 순수 함수인 `cloneVNode`도 테스트해.

DOM 의존성이 큰 `domToVNode`, `domChildrenToVNodes`, `createDomFromVNode`, `renderVNode`, `applyPatch`, `applyPatches`, `bindControls`, `initApp`, debug panel 갱신 로직은 이번 CI 대상에서 제외하고 수동 스모크 테스트만 정리해.

테스트 파일은 `tests/unit/**/*.test.js`에 추가해.
루트 `package.json`에는 `test`, `test:unit`, `ci` 스크립트를 만든다.
`.github/workflows/ci.yml`에서는 `push`와 `pull_request`마다 Node 22에서 `npm test`를 실행하게 한다.

자동화 범위에 해당하는 기능을 구현하거나 수정하면 관련 단위 테스트도 반드시 함께 추가하거나 수정해.
작업 결과에는 수정한 파일 목록, 추가한 테스트 파일, 실행한 명령, 통과/실패 여부, 남은 수동 테스트 항목을 포함해.
```

### Person A용 추가 문장
```text
Virtual DOM 스키마는 nodeType, tag, props, children, text 키를 그대로 사용해.
공백 텍스트 노드 제거 규칙을 반드시 반영해.
DOM/렌더 계층은 수동 스모크 테스트 항목까지 함께 정리해.
```

### Person B용 추가 문장
```text
Patch 타입은 CREATE, REMOVE, REPLACE, TEXT, PROPS만 사용해.
children diff는 index 기반으로만 구현하고 key 비교는 금지해.
`diff`, `diffProps`, `diffChildren`, `isRootPath`를 변경하면 관련 unit test도 함께 수정해.
```

### Person C용 추가 문장
```text
core 모듈의 인터페이스는 수정하지 말고 호출만 해.
Undo/Redo는 historyState { stack, index } 구조를 그대로 써.
`history.js`를 변경하면 관련 unit test를 함께 수정하고 `package.json`과 `.github/workflows/ci.yml`의 테스트 흐름을 유지해.
```

---

## 25. README 최소 목차
README는 아래 목차를 최소 포함해야 한다.

1. 프로젝트 소개
2. 핵심 기능
3. 폴더 구조
4. Virtual DOM 구조
5. Diff 알고리즘 설명
6. Patch 적용 방식
7. History / Undo / Redo
8. 테스트 및 CI
9. 한계점
10. 회고

---

## 26. 한계점 명시
README와 발표에서 아래 한계점을 솔직하게 설명한다.

- children diff가 index 기반이라 reorder 최적화는 지원하지 않음
- 이벤트 핸들러 diff 미지원
- 복잡한 form 상태 동기화 미지원
- contenteditable 편집 결과가 브라우저별로 다를 수 있음

---

## 27. 최종 데모 시나리오
발표 시 아래 순서로 데모한다.

1. 초기 샘플 렌더링 확인
2. 테스트 영역에서 텍스트 수정
3. Patch 클릭
4. 실제 영역 일부만 반영 확인
5. 버튼 class 또는 title 변경
6. Patch 클릭
7. 리스트 항목 추가
8. Patch 클릭
9. Undo / Redo 시연
10. Patch Log / VDOM Log 짧게 확인

---

## 28. 최종 확인 문장
이 문서는 팀 전체의 단일 구현 기준이다.
Codex가 제안하는 코드가 이 문서와 다르면 **Codex보다 이 문서가 우선**이다.
