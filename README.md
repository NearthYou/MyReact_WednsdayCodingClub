# Mini Virtual DOM Playground

브라우저 DOM을 Virtual DOM으로 변환하고, diff 결과를 patch로 적용해 실제 DOM을 부분 갱신하는 Vanilla JavaScript 실습 프로젝트입니다. 실제 영역과 편집 가능한 테스트 영역을 분리해 Patch, Undo, Redo, Reset 흐름을 확인할 수 있습니다.

## 1. 프로젝트 소개

- 구현 기준 문서는 `docs/TEAM_SPEC.md`입니다.
- 브라우저에서 바로 실행하는 ESM 구조를 유지합니다.
- UI 계층은 실제 렌더 트리의 루트 노드 1개를 기준으로 patch를 적용합니다.
- 테스트 영역은 `contenteditable`로 편집하고, Patch / Undo / Redo는 patch 기반으로 반영합니다. Reset과 비정상 DOM 복구 시에는 전체 렌더를 사용합니다.
- JS에서 만든 VNode는 함수 기반 이벤트 props(`onClick`, `onInput` 등)를 포함할 수 있습니다. DOM을 다시 읽어 만들 때는 이벤트를 직렬화하지 않고, 동일한 경로와 태그의 노드에 한해 기존 핸들러를 보존합니다.

## 2. 핵심 기능

- DOM -> VDOM 변환
- VDOM -> DOM 렌더링
- index 기반 children diff
- Patch 기반 부분 업데이트
- History 기반 Undo / Redo / Reset
- Patch / Current VDOM / History 디버그 패널

## 3. 폴더 구조

```text
project-root/
├─ assets/
├─ docs/
├─ src/
│  ├─ app.js
│  ├─ core/
│  ├─ state/
│  ├─ ui/
│  └─ styles/
├─ tests/
├─ index.html
├─ package.json
└─ README.md
```

## 4. Virtual DOM 구조

ElementVNode

```js
{
  nodeType: "element",
  tag: "div",
  props: {
    class: "card",
    onClick: handleClick
  },
  children: []
}
```

TextVNode

```js
{
  nodeType: "text",
  text: "Hello"
}
```

## 5. Diff 알고리즘 설명

- `diff(oldVNode, newVNode)`는 `CREATE`, `REMOVE`, `REPLACE`, `TEXT`, `PROPS` patch만 생성합니다.
- children 비교는 항상 index 기반입니다.
- 함수 기반 `on*` props는 diff 대상에 포함됩니다. 같은 함수 참조면 변경 없음으로 판단합니다.
- key 기반 재정렬 최적화는 지원하지 않습니다.
- `path=[]`는 렌더 트리의 실제 루트 DOM 노드 자신을 의미합니다.

## 6. Patch 적용 방식

- `#real-root`, `#test-root`는 patch 대상 자체가 아니라 렌더 컨테이너입니다.
- `currentVNode`는 컨테이너 내부의 실제 루트 노드 1개를 표현합니다.
- Patch 버튼은 `#test-root`의 child 구조를 읽어 새 VDOM을 만들고, DOM에서 사라진 함수 이벤트 props는 기존 `currentVNode`에서 구조적으로 병합한 뒤 diff를 계산합니다.
- 실제 적용은 `applyPatches(realRoot.firstChild, patches)`처럼 실제 루트 노드에 수행합니다.
- Undo와 Redo는 현재 history snapshot과 목표 snapshot 사이의 `diff`를 계산하고, 두 컨테이너 모두에 patch를 적용합니다.
- `#test-root`처럼 현재 DOM이 `currentVNode`와 어긋난 컨테이너는 patch 대신 `renderVNode`로 해당 컨테이너만 복구합니다.
- Reset은 두 컨테이너를 `renderVNode`로 전체 렌더합니다.

## 7. History / Undo / Redo

- history 구조는 `{ stack, index }`입니다.
- `stack[0]`은 항상 초기 snapshot입니다.
- 새 patch를 push하면 현재 index 뒤 redo 이력은 제거됩니다.
- Undo는 `index > 0`, Redo는 `index < stack.length - 1`일 때만 이동합니다.
- Patch Log는 Patch 버튼뿐 아니라 Undo / Redo에서 계산한 patch 배열도 표시합니다.
- 디버그 패널은 현재 index와 stack length를 함께 표시합니다.

## 8. 테스트 및 CI

- 현재 `package.json`은 `test`, `test:unit`, `ci` 스크립트를 제공합니다.
- 현재 `.github/workflows/ci.yml`은 Node 22에서 `npm test`를 실행하도록 구성돼 있습니다.
- 자동 테스트 범위는 순수 로직 계층 기준입니다.
- DOM/UI 의존성이 큰 `initApp`, `bindControls`, debug panel 갱신, patch DOM 반영은 수동 스모크 테스트 중심으로 확인합니다.

수동 스모크 테스트 항목:

1. 초기 샘플 렌더링 확인
2. 초기 샘플 버튼 클릭 시 콘솔 로그 핸들러 실행 확인
3. 테스트 영역 텍스트 수정 후 Patch 반영과 버튼 핸들러 유지 확인
4. 속성 변경과 자식 추가/삭제 후 Patch 반영 확인
5. 버튼 노드 제거/교체 후 이전 핸들러 제거 확인
6. 3회 patch 후 undo 2회, redo 1회 흐름과 버튼 핸들러 복원 확인
7. undo 후 새 patch 시 redo 이력 폐기 확인
8. Reset 후 초기 상태 복구 확인
9. debug panel과 버튼 disabled 상태 갱신 확인

## 9. 한계점

- children diff는 index 기반이라 reorder 최적화를 지원하지 않습니다.
- 함수 기반 이벤트는 `on*` DOM property 모델만 지원하고 `addEventListener` 다중 리스너 모델은 지원하지 않습니다.
- `onclick="foo()"` 같은 문자열 이벤트 속성은 지원하지 않습니다.
- 복잡한 form 상태 동기화는 다루지 않습니다.
- `contenteditable`에서 새 함수를 직접 입력해 이벤트를 만드는 기능은 없습니다. 기존 핸들러는 같은 경로와 태그의 노드에만 보존됩니다.
- `contenteditable` 편집 결과는 브라우저별로 차이가 날 수 있습니다.
- 테스트 영역이 단일 루트 구조를 잃으면 patch 전에 재동기화가 필요할 수 있습니다.

## 10. 회고

- Person A는 DOM/VDOM 변환과 렌더 계층을 담당합니다.
- Person B는 diff/patch 엔진과 path 규칙을 담당합니다.
- Person C는 앱 초기화, history, UI 바인딩, debug panel, README를 담당합니다.
- 최종 통합은 문서 규약 우선으로 병합합니다.
