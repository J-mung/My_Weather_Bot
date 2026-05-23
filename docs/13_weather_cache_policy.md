# Weather Query & Worker Cache Policy

## 목적

Phase 7의 목표는 같은 발표시각(`base_date`, `base_time`)과 같은 격자 좌표(`nx`, `ny`)에 대해
메인/검색/북마크 화면 이동 시 불필요한 기상청 API 재요청을 줄이는 것이다.

## React Query key 정책

날씨 Query key는 아래 순서를 고정한다.

```ts
["weather", type, base_date, base_time, nx, ny];
```

- `type`: `ULTRA_NOW`, `ULTRA_FORECAST`, `SHORT_FORECAST`, `TODAY_TEMP_RANGE`
- `base_date`, `base_time`: API 발표시각 기준
- `nx`, `ny`: 기상청 격자 좌표

이 순서를 유지하면 객체 프로퍼티 순서나 `Object.values()` 의존 없이 같은 요청이 같은 key로 모인다.

## Disabled placeholder Query 정책

`nx`, `ny`가 이미 있는 북마크/검색/선택 지역 경로는 첫 렌더에서 바로 params를 만들고 정상 Query key로 시작한다.
현재 위치처럼 브라우저 geolocation이 필요한 경로만 일시적으로 아래 pending key를 사용한다.

```ts
["weather", type, "pending", "current-location"];
```

pending key는 `enabled: false` 상태이며 persistence 대상에서 제외한다.

## Client cache TTL

`src/entities/weather/model/weather-cache-policy.ts`에서 API 타입별 `staleTime`/`gcTime`을 관리한다.

| API type           | staleTime | gcTime | 이유                                                               |
| ------------------ | --------: | -----: | ------------------------------------------------------------------ |
| `ULTRA_NOW`        |      20분 |  2시간 | 실황은 빠르게 변하지만 같은 발표시각 재요청은 줄인다.              |
| `ULTRA_FORECAST`   |      30분 |  2시간 | 초단기예보 발표 주기에 맞춰 짧게 유지한다.                         |
| `SHORT_FORECAST`   |     2시간 |  4시간 | 단기예보 발표 주기가 길어 같은 발표시각 응답을 더 오래 재사용한다. |
| `TODAY_TEMP_RANGE` |     4시간 |  8시간 | 당일 최고/최저 기준 자료는 하루 중 변동이 적다.                    |

영속화 maxAge는 4시간이다. 오래된 key가 복원되어도 화면에서 새 발표시각 key를 만들면 새 요청으로 전환된다.

## Worker Cache API 정책

Worker 프록시는 upstream 호출 전에 `caches.default`에서 아래 기준으로 조회한다.

- path: `/api/{endpoint}`
- query: `serviceKey`를 제외한 모든 query parameter를 key 이름 기준으로 정렬
- cache 대상: upstream 2xx 응답만

TTL은 endpoint 기준으로 설정한다.

| endpoint          |   TTL | 이유                             |
| ----------------- | ----: | -------------------------------- |
| `getUltraSrtNcst` |  20분 | 실황 반복 조회 완화              |
| `getUltraSrtFcst` |  30분 | 초단기예보 반복 조회 완화        |
| `getVilageFcst`   | 2시간 | 단기예보/최고최저 반복 조회 완화 |

응답에는 `X-Weather-Cache`를 붙인다.

- `HIT`: Worker cache에서 응답
- `MISS`: upstream 조회 후 cache 저장 예약
- `BYPASS`: cache 미사용 또는 upstream 비정상 응답

## 수정 시 주의

- `serviceKey`는 cache key와 클라이언트 응답에 포함하지 않는다.
- 오류 응답, 429, 5xx는 cache하지 않는다.
- `base_date/base_time/nx/ny`를 Query key에서 제거하면 화면 간 재사용과 신선도 기준이 깨진다.
