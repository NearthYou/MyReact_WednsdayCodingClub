
## 작업 방식

- 시작 브랜치: 각자 origin/main 최신 상태에서 자기 브랜치만 체크아웃해서 작업한다.
  - 기준 문서: 반드시 /docs/TEAM_SPEC.md 먼저 읽고,
    그다음 /docs/AGENT_RULES.md, 마지막으로 자기 역할
    문서를 읽는다.
  - 파일 소유권: 자기 담당 파일만 수정한다. 다른 사람 파일, 공통 문서, 폴더 구조, export 이름, 자료구조 키 이름은 건드리
    지 않는다.
  - 역할 분담:
      - Person A: src/core/vdom.js, src/core/render.js, 필요 시 src/core/dom-utils.js
      - Person B: src/core/diff.js, src/core/patch.js, 필요 시 src/core/path-utils.js
      - Person C: src/app.js, src/state/history.js, src/ui/bindings.js, src/ui/debug-panel.js, src/styles/main.css,
        README.md
  - 구현 규칙: Vanilla JS ESM만 사용, children diff는 index 기반만 허용, patch 타입은 5종만 허용, 이벤트 핸들러 diff나
    외부 라이브러리 추가는 금지.
  - API 변경 요청: 공용 인터페이스를 바꿔야겠으면 코드부터 바꾸지 말고 이유, 제안 인터페이스, 영향 파일을 먼저 보고한다.
  - 완료 보고 형식: 수정 파일, 완료 기능, 직접 테스트한 내용, 남은 리스크, API 변경 요청 여부를 같이 보낸다.
  - 병합 방식: 바로 main에 넣지 말고 자기 브랜치만 푸시한다. 병합은 A -> B -> C 순서로 진행한다.
  - 진행 문서: INTEGRATION_LOG.md는 통합자만 업데이트한다. 각자 수정하지 않는다.

  에이전트에 그대로 붙여넣을 공통 머리말도 같이 주면 좋습니다.

  아래 명세서를 절대 기준으로 삼아 구현해줘.
  파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
  지정된 파일만 수정하고 다른 파일은 수정하지 마.
  Vanilla JavaScript ESM 기준으로 작성해줘.
  먼저 docs/TEAM_SPEC.md, docs/AGENT_RULES.md, 그리고 네 역할 문서를 읽고 작업해.
  작업이 끝나면 수정 파일, 완료 기능, 테스트 결과, 남은 리스크, API 변경 요청 여부를 보고해.
  
## 역할별 프롬프트 예시

Person A

아래 명세서를 절대 기준으로 삼아 구현해줘.
파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
지정된 파일만 수정하고 다른 파일은 수정하지 마.
Vanilla JavaScript ESM 기준으로 작성해줘.
먼저 docs/TEAM_SPEC.md, docs/AGENT_RULES.md, docs/AGENT_PERSON_A.md를 읽고 작업해.

브랜치는 feat/vdom-personA 를 사용해.
너의 작업 범위는 아래 파일만이야.
- src/core/vdom.js
- src/core/render.js
- 필요 시 src/core/dom-utils.js

구현 목표:
- domToVNode
- domChildrenToVNodes
- cloneVNode
- createDomFromVNode
- renderVNode
- setDomProps

반드시 지킬 것:
- Virtual DOM 스키마는 nodeType, tag, props, children, text 키를 그대로 사용해.
- 의미 없는 공백 텍스트 노드는 제거해.
- 주석 노드는 무시해.
- boolean attribute는 존재 시 `true`로 저장해.
- diff에서 기대하는 VDOM 구조를 바꾸지 마.
- 이벤트 핸들러 diff를 위해 props 규칙을 확장하지 마.

금지:
- 다른 역할 파일 수정
- export 이름 변경
- 새 라이브러리 추가
- 문서 수정

작업이 끝나면 아래 형식으로 보고해.
1. 수정한 파일
2. 완료한 기능
3. 직접 수행한 테스트
4. 남은 리스크
5. 공용 API 변경 요청 여부

Person B

아래 명세서를 절대 기준으로 삼아 구현해줘.
파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
지정된 파일만 수정하고 다른 파일은 수정하지 마.
Vanilla JavaScript ESM 기준으로 작성해줘.
먼저 docs/TEAM_SPEC.md, docs/AGENT_RULES.md, docs/AGENT_PERSON_B.md를 읽고 작업해.

브랜치는 feat/diff-personB 를 사용해.
너의 작업 범위는 아래 파일만이야.
- src/core/diff.js
- src/core/patch.js
- 필요 시 src/core/path-utils.js

구현 목표:
- diff
- diffProps
- diffChildren
- applyPatch
- applyPatches
- getNodeByPath
- getParentNodeByPath

반드시 지킬 것:
- patch 타입은 CREATE, REMOVE, REPLACE, TEXT, PROPS만 사용해.
- children diff는 index 기반으로만 구현해.
- key 기반 reconciliation과 reorder 최적화는 구현하지 마.
- path는 루트 기준 인덱스 배열을 사용해.
- diff 결과는 patch 배열이어야 해.
- remove 순서 때문에 path가 깨지지 않게 처리해.

금지:
- 새 patch 타입 추가
- patch 타입 이름 변경
- 다른 역할 파일 수정
- 새 라이브러리 추가
- 문서 수정

작업이 끝나면 아래 형식으로 보고해.
1. 수정한 파일
2. 완료한 기능
3. 직접 수행한 테스트
4. 남은 리스크
5. 공용 API 변경 요청 여부

Person C

아래 명세서를 절대 기준으로 삼아 구현해줘.
파일명, export 함수명, 자료구조 키 이름을 바꾸면 안 돼.
지정된 파일만 수정하고 다른 파일은 수정하지 마.
Vanilla JavaScript ESM 기준으로 작성해줘.
먼저 docs/TEAM_SPEC.md, docs/AGENT_RULES.md, docs/AGENT_PERSON_C.md를 읽고 작업해.

브랜치는 feat/app-personC 를 사용해.
너의 작업 범위는 아래 파일만이야.
- src/app.js
- src/state/history.js
- src/ui/bindings.js
- src/ui/debug-panel.js
- src/styles/main.css
- README.md

구현 목표:
- initApp
- history 생성/이동 함수
- Patch / Undo / Redo / Reset 버튼 연결
- debug panel 업데이트
- 버튼 상태 반영
- README 정리

반드시 지킬 것:
- core 모듈 인터페이스를 수정하지 말고 호출만 해.
- history 구조는 { stack, index } 를 그대로 사용해.
- Patch 버튼은 test-root의 현재 구조를 기준으로 새 VDOM을 만들어야 해.
- Undo/Redo는 history snapshot 간 diff/patch를 기본으로 사용하고, patch 불가능한 컨테이너만 fallback render 해야 해.
- Reset은 전체 렌더로 유지해.
- UI 계층에서 diff/patch 로직을 중복 구현하지 마.

금지:
- VDOM 스키마 변경
- patch 스키마 변경
- 다른 역할 파일 수정
- 새 라이브러리 추가
- 문서 수정은 README만 허용

작업이 끝나면 아래 형식으로 보고해.
1. 수정한 파일
2. 완료한 기능
3. 직접 수행한 테스트
4. 남은 리스크
5. 공용 API 변경 요청 여부

## 버그 수정용 프롬프트

역할
너는 “Codex 버그 수정 전문가”다. 목표는 재현 가능한 원인 규명 → 최소 수정(Minimal Fix) → 테스트로 검증 → 안전한 PR 수준의 변경사항을 만드는 것이다.

작업 규칙

먼저 재현(How to Reproduce) 과 실제/기대 결과를 정리해라. 
정보가 부족하면 “필요한 정보 체크리스트”를 먼저 제시하되, 가능하면 현재 정보로도 가설을 세워 진행하라.

원인을 1개로 단정하지 말고 가능성 높은 Top 3 원인을 우선순위로 제시하고, 각 원인마다 “확인 방법(로그/테스트/코드 포인트)”을 써라.
수정은 최소 변경 원칙으로. 리팩토링/스타일 변경은 버그 수정과 분리한다.

변경 후 반드시:
새/기존 테스트 실행(또는 테스트가 없으면 최소 재현 테스트 추가)
예외 케이스/회귀 위험 점검
성능/보안/호환성 영향 한 줄 평가
