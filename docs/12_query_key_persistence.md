### 배경

메인 화면과 북마크 화면에서 tanstack query를 활용하고 있고,
key를 통해서 캐시를 유지하고 있다.

캐시가 생존해 있는 시간 동안은 화면 이동을 해도 API 요청이 발생하지 않으며
데이터를 화면에서 바로 확인 가능하다.

그러나 새로고침하면 API 요청이 발생하고 Skeleton UI가 출력되는 모습을 확인할 수 있다.

메모리 캐시만 사용하고 있어 새로고침 이후에는 캐시를 재사용할 수 없다.

### 문제 정의

tanstack query의 캐시를 활용하고 있음에도 새로고침 때면
API 요청이 발생하는 이유는 tanstack query cache(data, state, key)가 메모리에 생존해 있기 때문이다.

메모리에 생존해 있으면 새로고침 되면서 데이터가 삭제되는 휘발성이기에
자연스러운 반응이다.

그렇지만 의도와는 다른 동작이기 때문에 개선할 필요가 있다.

### 변경 목표

메모리에 저장되는 tanstack query cache를 HDD 또는 SSD에 저장한다.

이를 위해 localStorage를 활용해야 하는데 2가지 방안이 있다.

1. 수동 조작을 통한 영속화
2. tanstack query persistence 라이브러리를 통한 영속화

### 변경 방향

#### 방안 결정

선택지에 따른 특징을 우선 정리해보자.

1. 수동 방식

- useBookmarkSummary, useWeatherSummary의 결과를 직접 localStorage에 저장/복원
- 외부 라이브러리를 의존하지 않는 특징
- 단, 만료시간, 키 관리, invalidation을 직접 구현해야 함

2. tanstack query persistence 라이브러리

- 기존 query 캐시를 localStorage에 그대로 저장/복원
- 만료시간, 키 관리, invalidation 등을 라이브리러에게 위임
- 앱 시작 시 localStorage에 저장된 query cache를 복원하고, 필요 시 백그라운드에서 재검증을 진행해 화면 깜빡임이 발생할 수 있음

기상청 데이터의 특성상 빈번하게 갱신되지 않기 때문에 네트워크 재연결에 따른 화면 깜빡임은 드물거라 판단된다.

키 생존 시간을 적절히 지정한다면 오래된 데이터를 보여주는 문제도 해결 가능하다.

또한 직접 구현해야 하는 부담을 줄일 수 있으므로 tanstack query persistence 라이브러리를 활용한다.

### 기대 효과

이번 변경이 적용되면 다음 결과를 기대할 수 있다.

1. 데이터 유지

- 애플리케이션 종료 직전에는 캐시를 localStorage에 저장한다.
- 애플레케이션 시작 시, localStorage에서 캐시를 복원한다.

2. 화면 로딩 속도 개선

- 새로고침해도 날씨 요약 정보, 북마크 요약 정보가 바로 보인다.
- API 응답이 오기까지 기다리지 않고 화면을 빠르게 띄울 수 있다.
- 같은 query key면 복원된 데이터를 바로 보여준다.

### 구현 범위

이번 작업의 수정 대상은 다음과 같다.

1. 라이브러리 설치

- react-query-persist-client: tanstack query 캐시 persistence 연결 담당
- query-async-storage-persister: localStorage를 저장소로 쓰게 해주는 persister

2. App.tsx

- persistence provider 연결
- maxAge: 5분 지정
- 'weather'로 시작하는 캐시에 대해서만 필터링
