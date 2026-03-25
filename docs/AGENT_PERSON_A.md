# Person A Guide

## Mission

Person A는 DOM -> VDOM 변환과 VDOM -> DOM 렌더링 계층을 구현한다.

## Owned Files

- `src/core/vdom.js`
- `src/core/render.js`
- 필요 시 `src/core/dom-utils.js`

## Must Implement

- `domToVNode`
- `domChildrenToVNodes`
- `cloneVNode`
- `createDomFromVNode`
- `renderVNode`
- `setDomProps`

## Required Invariants

- VDOM 스키마는 `nodeType`, `tag`, `props`, `children`, `text`를 그대로 사용한다.
- 의미 없는 공백 텍스트 노드는 제거한다.
- 주석 노드는 무시한다.
- boolean attribute는 존재 시 `""` 문자열로 저장한다.
- element node는 반드시 `tag`, `props`, `children`을 가진다.
- text node는 반드시 `text`를 가진다.

## Forbidden Changes

- diff에서 기대하는 VDOM 모양을 바꾸지 않는다.
- 다른 역할 파일을 수정하지 않는다.
- 이벤트 핸들러 diff를 구현하려고 props 규칙을 확장하지 않는다.

## Done Criteria

- 샘플 HTML이 안정적으로 VDOM으로 변환된다.
- 공백과 주석 노드가 올바르게 제거된다.
- VDOM에서 DOM을 재귀적으로 렌더링할 수 있다.
- 초기 렌더용 `renderVNode`와 patch 단계용 역할이 분리된다.

## Manual Checks

- `disabled` 같은 boolean attribute가 `""`로 저장되는지 확인
- `Hello `, ` Hello` 같은 의미 있는 공백은 유지되는지 확인
- 줄바꿈/들여쓰기만 있는 텍스트 노드는 제거되는지 확인
