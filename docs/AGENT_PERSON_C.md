# Person C Guide

## Mission

Person C는 앱 초기화, UI 바인딩, history, debug panel, README, 데모 흐름을 담당한다.

## Owned Files

- `src/app.js`
- `src/state/history.js`
- `src/ui/bindings.js`
- `src/ui/debug-panel.js`
- `src/styles/main.css`
- `README.md`

## Must Implement

- `initApp`
- history 생성/이동 함수
- Patch / Undo / Redo / Reset 버튼 연결
- debug panel 업데이트
- 버튼 상태 반영
- README 확정

## Required Invariants

- core 모듈의 인터페이스를 수정하지 않고 호출만 한다.
- history 구조는 `{ stack, index }`를 그대로 사용한다.
- Patch 버튼은 `#test-root`의 현재 구조를 기준으로 새 VDOM을 만든다.
- Undo/Redo/Reset은 전체 렌더 전략으로 일관되게 동작한다.

## Forbidden Changes

- VDOM 스키마나 patch 스키마를 직접 바꾸지 않는다.
- diff 로직이나 patch 로직을 UI 계층에서 중복 구현하지 않는다.
- 다른 역할 파일을 수정하지 않는다.

## Done Criteria

- 초기 샘플 로드 후 실제 영역과 테스트 영역이 준비된다.
- Patch / Undo / Redo / Reset 흐름이 연결된다.
- debug panel과 버튼 상태가 현재 history를 반영한다.
- README에 기능, 구조, 한계점, 테스트 케이스, 데모 흐름이 정리된다.

## Manual Checks

- 3회 patch 후 undo 2회, redo 1회
- undo 후 새 patch 시 redo 폐기
- patch 후 테스트 영역 재동기화
- debug panel 내용 갱신
