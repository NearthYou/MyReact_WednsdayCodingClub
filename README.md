# Mini Virtual DOM Playground

Vanilla JavaScript로 DOM -> Virtual DOM 변환, diff, patch, history를 구현하는 팀 프로젝트입니다.

## Project Overview

- 실제 DOM을 읽어 Virtual DOM으로 변환합니다.
- 이전 VDOM과 새 VDOM을 비교해 변경점만 실제 DOM에 반영합니다.
- 실제 영역과 테스트 영역을 분리해 Patch, Undo, Redo, Reset 흐름을 검증합니다.
- 서버나 빌드 도구 없이 브라우저에서 바로 실행하는 구조를 유지합니다.

## Core Features

- DOM -> VDOM 변환
- VDOM -> DOM 렌더링
- Index 기반 children diff
- Patch 기반 DOM 업데이트
- History 기반 Undo / Redo
- Patch / VDOM / History 디버그 패널

## Team Workflow

- 구현 기준 문서: `docs/TEAM_SPEC.md`
- 에이전트 공통 규칙: `docs/AGENT_RULES.md`
- 역할별 작업 지시:
  - `docs/AGENT_PERSON_A.md`
  - `docs/AGENT_PERSON_B.md`
  - `docs/AGENT_PERSON_C.md`
- 병합 진행 기록: `docs/INTEGRATION_LOG.md`

## Branches

- `main`: 공통 스캐폴드와 최종 통합 브랜치
- `feat/vdom-personA`
- `feat/diff-personB`
- `feat/app-personC`

## Folder Structure

```text
project-root/
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
└─ docs/
   ├─ TEAM_SPEC.md
   ├─ AGENT_RULES.md
   ├─ AGENT_PERSON_A.md
   ├─ AGENT_PERSON_B.md
   ├─ AGENT_PERSON_C.md
   └─ INTEGRATION_LOG.md
```

## Virtual DOM Shape

```js
{
  nodeType: "element",
  tag: "div",
  props: {},
  children: []
}
```

```js
{
  nodeType: "text",
  text: "Hello"
}
```

## Diff and Patch Scope

- Patch 타입은 `CREATE`, `REMOVE`, `REPLACE`, `TEXT`, `PROPS`만 사용합니다.
- children diff는 반드시 index 기반입니다.
- key 기반 reconciliation은 구현하지 않습니다.
- 이벤트 핸들러 diff는 이번 범위에서 제외합니다.

## History

- 구조: `{ stack: [/* snapshots */], index: 0 }`
- Undo는 `index > 0`일 때만 가능
- Redo는 `index < stack.length - 1`일 때만 가능
- 새 patch 후 redo 이력은 삭제합니다.

## Manual Test Cases

1. 텍스트 변경
2. 속성 변경
3. 노드 추가
4. 노드 삭제
5. 태그 교체
6. 중첩 구조 변경
7. 다중 변경
8. Undo / Redo
9. Undo 후 새 patch로 redo 폐기
10. 공백 노드로 인한 과도한 diff 미발생 확인

## Limits

- children reorder 최적화 미지원
- 이벤트 핸들러 diff 미지원
- 복잡한 form 상태 동기화 미지원
- `contenteditable` 결과가 브라우저별로 다를 수 있음

## Retrospective

- 브랜치 병합 후 각 역할별 구현 이슈와 인터페이스 조정 내역을 기록합니다.
- 최종 회고는 데모와 통합 테스트가 끝난 뒤 문서화합니다.
