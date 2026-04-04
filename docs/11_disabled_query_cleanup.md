# Disabled Query 정리 메모

## 배경

- 북마크 화면의 API 호출 수를 줄이기 위해 `useBookmarkSummary` 훅을 만들고,
  `ULTRA_NOW`, `TODAY_TEMP_RANGE` 두 종류의 Query만 사용하도록 개선했다.
- React Query Devtools로 확인한 결과, 실제 데이터 Query 외에 아래와 같은 disabled Query가 남아있다.

```txt
["weather", "TODAY_TEMP_RANGE"]
["weather", "ULTRA_NOW"]
```

## 현재 관측 결과

- 정상 Query
  - `["weather", "TODAY_TEMP_RANGE", "20260404", "0200", 101, 78]`
  - `["weather", "ULTRA_NOW", "20260404", "1700", 59, 125]`
- 비정상/불완전 Query
  - `["weather", "TODAY_TEMP_RANGE"]`
  - `["weather", "ULTRA_NOW"]`
- 네트워크 요청과 화면 데이터는 정상 동작한다.
- 다른 화면으로 이동했다가 북마크로 돌아오면 fresh Query 6개가 유지된다.
- 새로고침 시에는 React Query 메모리 캐시가 초기화되므로 다시 fetching 된다.

## 원인

현재 [useWeatherQuery.ts](../src/entities/weather/model/useWeatherQuery.ts)는 아래 흐름으로 동작한다.

1. 첫 렌더에서 `params`는 `null`
2. `useQuery`는 먼저 생성되지만 `enabled: false` 상태
3. `useEffect`에서 `resolveParams()` 실행 후 `params`가 채워짐
4. 이후 최종 `queryKey`를 가진 정상 Query가 생성됨

즉, `params`가 준비되기 전에 `["weather", type]` 형태의 placeholder Query가 먼저 생성되고,
이 Query가 Devtools에 disabled 상태로 남는다.

## 영향

- 기능적인 오류는 아님
- 실제 요청 수/캐시 동작에는 큰 문제 없음
- 다만 Devtools 기준으로 Query가 지저분하게 보이고,
  초기 마운트 시 observer가 잠깐 placeholder Query에 붙었다가 이동하는 구조라
  화면이 미세하게 번쩍이는 원인이 될 수 있다.

## 다음 작업 때 확인할 포인트

### 1) 현재 구조 유지 + 의도 명확화

- `params === null`일 때 queryKey를 아래처럼 명시적으로 표현

```ts
queryKey: params
  ? ["weather", type, params.base_date, params.base_time, params.nx, params.ny]
  : ["weather", type, "pending"]
```

- 장점: 상태 의도가 분명해짐
- 단점: disabled Query 자체는 여전히 남음

### 2) params 준비 후 Query 마운트

- `resolveParams()`로 `RequestWeatherParams`를 먼저 준비한 뒤,
  그 다음에만 Query를 생성하도록 구조를 바꾸는 방법
- 장점: placeholder Query 제거 가능
- 단점: 훅 구조 변경 범위가 커짐

### 3) 북마크/현재 위치 경로 분리 검토

- 북마크/검색 결과처럼 `nx, ny`가 이미 있는 경우는 params 생성 경로를 단순화
- 현재 위치 조회처럼 좌표를 직접 계산해야 하는 경우만 비동기 위치 조회 수행

## 결론

- 현재 상태는 "캐시가 안 된다"가 아니라 "disabled placeholder Query가 남는다"에 가깝다.
- 다음 리팩터링 때는 `params` 준비 시점과 Query 생성 시점을 분리해서
  disabled Query를 제거하는 방향으로 정리한다.
