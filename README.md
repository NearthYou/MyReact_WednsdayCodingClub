# My React Playground

<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/10b5c081-373d-40f5-9be8-a412a012737d" />


브라우저의 실제 DOM을 Virtual DOM으로 변환하고, 이전 상태와 새 상태를 비교해 변경된 부분만 patch로 반영하는 Vanilla JavaScript 프로젝트입니다.

## Overview

![poster](./Capture.png)

- DOM -> VDOM 변환
- VDOM diff 계산
- patch 기반 부분 업데이트
- `Patch`, `Undo`, `Redo`, `Reset`
- `Patch Log`, `Current VDOM`, `History` 디버그 패널 제공

## DOM -> VDOM

이 프로젝트는 테스트 영역이나 실제 렌더링 영역의 DOM을 읽어서 `VNode` 트리로 변환합니다.  
변환은 [`src/core/vdom.js`]의 `domToVNode`, `domChildrenToVNodes`를 중심으로 처리됩니다.

### 변환 흐름

```mermaid
flowchart TD
    A[DOM Node] --> B{nodeType 확인}
    B -->|Comment| C[무시]
    B -->|Text| D[공백 여부 확인]
    D -->|공백만 있음| C
    D -->|텍스트 유지| E[Text VNode 생성]
    B -->|Element| F[속성 수집]
    F --> G[이벤트 속성 제외]
    G --> H[자식 노드 재귀 순회]
    H --> I[Element VNode 생성]
```

### 변환 예시

```html
<div class="card">
  <h1>Hello</h1>
  <p title="intro">Virtual DOM</p>
</div>
```

```js
{
  nodeType: "element",
  tag: "div",
  props: { class: "card" },
  children: [
    {
      nodeType: "element",
      tag: "h1",
      props: {},
      children: [{ nodeType: "text", text: "Hello" }]
    },
    {
      nodeType: "element",
      tag: "p",
      props: { title: "intro" },
      children: [{ nodeType: "text", text: "Virtual DOM" }]
    }
  ]
}
```

## Rendering And Patch Flow

초기 렌더링은 샘플 HTML을 읽어 VDOM으로 만든 뒤, 이를 테스트 영역에 렌더링하는 방식으로 시작합니다.  
이후 사용자가 테스트 영역을 수정하면 새 VDOM을 만든 뒤 diff 결과만 실제 DOM에 반영합니다.

### 업데이트 흐름

```mermaid
flowchart LR
    A[사용자: 테스트 영역 수정] --> B[domChildrenToVNodes]
    B --> C[새 VDOM 생성]
    C --> D[diff 현재 VDOM vs 새 VDOM]
    D --> E[patch 생성]
    E --> F[applyPatches]
    F --> G[실제 DOM 반영]
    G --> H[History 저장]
    H --> I[Debug Panel 갱신]
```

### Patch 버튼 기준 처리 순서

```mermaid
sequenceDiagram
    participant U as User
    participant T as Test Root
    participant A as app.js
    participant V as vdom.js
    participant D as diff.js
    participant P as patch.js
    participant H as history.js

    U->>T: DOM 수정
    U->>A: Patch 클릭
    A->>V: domChildrenToVNodes(testRoot)
    V-->>A: newVNode
    A->>D: diff(currentVNode, newVNode)
    D-->>A: patches
    A->>P: applyPatches(realRoot, patches)
    A->>H: pushHistory(newVNode)
    A-->>U: 실제 영역 / 로그 갱신
```

## Core Data Structures

```mermaid
classDiagram
    class VNode {
      +string nodeType
      +string tag
      +object props
      +VNode[] children
      +string text
    }

    class Patch {
      +string type
      +number[] path
      +VNode node
      +string text
      +object props
    }

    class HistoryState {
      +VNode[] stack
      +number index
    }

    HistoryState --> VNode : snapshot
    Patch --> VNode : optional node
```

## Patch Types

- `CREATE`
- `REMOVE`
- `REPLACE`
- `TEXT`
- `PROPS`

## Architecture

```mermaid
flowchart TB
    APP[app.js]

    subgraph CORE[core]
        VDOM[vdom.js]
        DIFF[diff.js]
        PATCH[patch.js]
        RENDER[render.js]
    end

    subgraph STATE[state]
        HISTORY[history.js]
    end

    subgraph UI[ui]
        BIND[bindings.js]
        DEBUG[debug-panel.js]
        TREE[tree-formatter.js]
    end

    APP --> VDOM
    APP --> DIFF
    APP --> PATCH
    APP --> RENDER
    APP --> HISTORY
    APP --> BIND
    APP --> DEBUG
    DEBUG --> TREE
```

## Project Structure

```text
src/
  app.js
  core/
    vdom.js
    diff.js
    patch.js
    render.js
    dom-utils.js
    path-utils.js
  state/
    history.js
  ui/
    bindings.js
    debug-panel.js
    tree-formatter.js
  styles/
    main.css
tests/unit/
assets/
docs/
```

## Tech Notes

- Vanilla JavaScript ESM 기반
- index 기반 children diff
- 히스토리 스택 기반 `Undo` / `Redo`
- 단위 테스트: `node:test`
- CI: GitHub Actions

## Limitations

- children diff는 index 기반이라 reorder 최적화는 지원하지 않습니다.
- 이벤트 핸들러 diff는 지원하지 않습니다.
- 복잡한 form 상태 동기화까지는 다루지 않습니다.
