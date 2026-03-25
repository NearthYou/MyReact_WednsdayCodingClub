# Person B Guide

## Mission

Person B는 diff 계산과 patch 적용 엔진을 구현한다.

## Owned Files

- `src/core/diff.js`
- `src/core/patch.js`
- 필요 시 `src/core/path-utils.js`

## Must Implement

- `diff`
- `diffProps`
- `diffChildren`
- `applyPatch`
- `applyPatches`
- `getNodeByPath`
- `getParentNodeByPath`

## Required Invariants

- patch 타입은 `CREATE`, `REMOVE`, `REPLACE`, `TEXT`, `PROPS`만 사용한다.
- children diff는 index 기반으로만 구현한다.
- key 기반 reconciliation과 reorder 최적화는 구현하지 않는다.
- path는 루트 기준 인덱스 배열을 사용한다.
- diff 결과는 patch 배열이어야 한다.

## Forbidden Changes

- patch 타입 이름을 바꾸지 않는다.
- 새 patch 타입을 추가하지 않는다.
- 다른 역할 파일을 수정하지 않는다.

## Done Criteria

- 핵심 5가지 케이스를 patch로 생성할 수 있다.
- patch를 실제 DOM에 안정적으로 적용할 수 있다.
- remove 순서로 인한 경로 깨짐 없이 동작한다.
- `[]` 루트 path도 처리 가능하다.

## Manual Checks

- 텍스트 변경
- props 변경
- 노드 추가
- 노드 삭제
- 태그 교체
- 중첩 구조 path 탐색
