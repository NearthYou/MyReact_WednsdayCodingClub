# Agent Collaboration Rules

이 문서는 모든 에이전트가 공통으로 따라야 하는 운영 규칙이다.

## Read Order

모든 에이전트는 작업 시작 전에 아래 순서로 문서를 읽는다.

1. `docs/TEAM_SPEC.md`
2. `docs/AGENT_RULES.md`
3. 자신의 역할 문서

## Source of Truth

- 구현 계약은 `docs/TEAM_SPEC.md`가 우선이다.
- 작업 운영 규칙은 `docs/AGENT_RULES.md`가 우선이다.
- 역할별 상세 책임은 각 역할 문서가 우선이다.
- Codex나 에이전트가 제안한 내용이 문서와 다르면 문서가 우선이다.

## File Ownership

- Person A: `src/core/vdom.js`, `src/core/render.js`, 필요 시 `src/core/dom-utils.js`
- Person B: `src/core/diff.js`, `src/core/patch.js`, 필요 시 `src/core/path-utils.js`
- Person C: `src/app.js`, `src/state/history.js`, `src/ui/bindings.js`, `src/ui/debug-panel.js`, `src/styles/main.css`, `README.md`
- 통합자 전용: `docs/TEAM_SPEC.md`, `docs/AGENT_RULES.md`, `docs/INTEGRATION_LOG.md`

## Non-Negotiable Rules

- 파일명, 폴더명, export 함수명, 자료구조 키 이름을 바꾸지 않는다.
- 자기 소유 파일 외에는 수정하지 않는다.
- ESM과 상대경로 import만 사용한다.
- Vanilla JavaScript만 사용한다.
- 새 패키지, 프레임워크, TypeScript, 서버 코드를 추가하지 않는다.
- 외부 네트워크 API 호출이나 `fetch`를 도입하지 않는다.
- `innerHTML`로 실제 영역 전체를 매번 갈아엎는 방식은 허용하지 않는다.
- children diff는 index 기반으로만 구현한다.
- 이벤트 핸들러 diff는 구현 범위에서 제외한다.

## API Change Request Policy

여기서 "API 요청"은 외부 네트워크 호출이 아니라 공유 모듈 인터페이스 변경 요청을 의미한다.

- 새 export 추가, 함수 시그니처 변경, 자료구조 키 변경이 필요하면 코드부터 바꾸지 않는다.
- 먼저 작업 결과 보고에 아래 항목을 남긴다.
  - 변경 필요 이유
  - 현재 인터페이스
  - 제안 인터페이스
  - 영향 받는 파일
  - 하위 호환 여부
- 통합자가 승인하면 문서를 먼저 갱신한 뒤 구현을 진행한다.
- 승인 전까지 기존 인터페이스가 기준이다.

## Merge-Time Documentation Rule

- 진행 기록 문서는 통합자만 갱신한다.
- 개별 에이전트는 `docs/INTEGRATION_LOG.md`를 직접 수정하지 않는다.
- 공통 규약 변경이 승인된 경우에만 통합자가 `docs/TEAM_SPEC.md`와 관련 역할 문서를 함께 업데이트한다.

## Required Delivery Format

에이전트는 작업을 마칠 때 아래 정보를 반드시 남긴다.

1. 수정한 파일 목록
2. 완료한 기능
3. 직접 수행한 수동 테스트
4. 남은 리스크
5. 필요한 API 변경 요청 여부

## Prompt Header

모든 역할별 에이전트 프롬프트에는 아래 문장을 공통으로 포함한다.

```text
아래 명세서를 절대 기준으로 삼아 구현해줘.
파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
지정된 파일만 수정하고 다른 파일은 수정하지 마.
Vanilla JavaScript ESM 기준으로 작성해줘.
```
