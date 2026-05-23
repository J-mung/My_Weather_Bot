# Air Quality Metric Plan

## 배경

메인 화면의 상단 현재 날씨 카드에서 `HUMIDITY`를 이미 보여주고 있는데,
`View Precipitation Map` CTA 바로 위 metric 영역에서도 `Humidity`를 다시 보여주고 있다.
중복 정보를 줄이고 생활형 판단 가치를 높이기 위해 이 영역은 대기질 정보로 전환한다.

## 목표 UI

`View Precipitation Map` 바로 위 metric grid를 아래처럼 구성한다.

1. `Fine Dust` — 미세먼지 PM10
2. `Ultra Fine Dust` — 초미세먼지 PM2.5
3. `Rain` — 강수확률/강수량
4. `Wind` — 풍속

반응형 기준:

- 모바일: 2열
- 데스크톱: 4열

## 데이터 소스 후보

공공데이터포털 `한국환경공단_에어코리아_대기오염정보` OpenAPI를 사용한다.

확인한 공식 정보:

- 데이터 유형: REST, JSON+XML
- 제공 항목: 측정소별 실시간 측정정보, 시도별 실시간 측정정보, 대기질 예보통보, 초미세먼지 주간예보 등
- 키워드: 미세먼지, 초미세먼지, 에어코리아
- 개발계정 트래픽: 500건
- 서비스 URL: `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc`

## 1차 구현 범위

### API/Worker

- `/api/air-quality/*` 또는 `/api/airkorea/*` 프록시 추가
- 환경변수 추가
  - `AIRKOREA_API_BASE_URL` 또는 Vite 전용 `VITE_AIRKOREA_BASE_URL`
  - 기존 `API_KEY` 재사용 가능 여부 확인 후 필요 시 `AIRKOREA_API_KEY` 분리
- 허용 endpoint allowlist 추가
- Worker Cache API 적용
  - 실시간 측정값은 20~30분 TTL 후보
  - 오류/429/5xx는 cache하지 않음

### 도메인

- `AirQualitySummary`
  - `pm10Value`: number | null
  - `pm10Grade`: 좋음/보통/나쁨/매우나쁨/unavailable
  - `pm25Value`: number | null
  - `pm25Grade`: 좋음/보통/나쁨/매우나쁨/unavailable
  - `stationName`: string | null
  - `dataTime`: string | null
- PM10/PM2.5 등급 mapper 추가

### 위치 매핑

1차는 현재 앱의 행정구역 문자열에서 시도명을 추출해 `시도별 실시간 측정정보조회`를 사용한다.

- 장점: 측정소 좌표 데이터 없이 시작 가능
- 단점: 구/동 단위 정확도는 측정소 매칭 로직에 의존

2차는 측정소 정보/근접 측정소 매핑을 추가한다.

### 화면

- 기존 lower metric의 `Humidity` 제거
- `Fine Dust`, `Ultra Fine Dust` 카드 추가
- 데이터가 없으면 `--㎍/㎥`, 설명은 `대기질 정보를 준비 중이에요.` fallback
- 검색 대표 카드에는 1차에서 추가하지 않고 메인 화면 안정화 후 확장

## 검증 계획

- `npm run lint`
- `npm run build`
- Worker synthetic test
  - allowlist 거부/허용
  - serviceKey 미노출
  - `MISS -> HIT` cache 확인
- Headless Chrome smoke
  - 모바일 375px에서 2열 metric overflow 없음
  - 데스크톱에서 4개 metric 카드 정렬 확인
  - AirQuality 실패 시 날씨 요약 화면이 깨지지 않음

## 구현 기록

### 2026-05-23 환경변수 확인

- `.env`에 `VITE_AIRKOREA_BASE_URL`, `VITE_AIRKOREA_API_KEY`가 있는 것을 확인했다.
- Vite proxy는 `VITE_AIRKOREA_BASE_URL`과 `VITE_AIRKOREA_API_BASE_URL`을 모두 지원하도록 보강했다.
- Vite dev proxy는 `.dev.vars`를 기본 fallback으로 읽고 `.env` 값을 우선 적용하도록 정리했다.
- 로컬 live AirKorea 호출은 HTTP 403 `Forbidden`을 반환했다. key 값은 응답/로그에 노출되지 않았다. API 활용신청/권한 상태 확인이 필요하다.

### 2026-05-23 1차 구현

- `/api/air-quality/getCtprvnRltmMesureDnsty` Worker/Vite 프록시를 추가했다.
- AirKorea API key는 `AIRKOREA_API_KEY`를 우선 사용하고, 없으면 기존 `API_KEY`를 fallback으로 사용한다.
- 시도별 실시간 측정정보에서 PM10/PM2.5 값을 가져와 메인 metric에 표시한다.
- 행정구역 문자열에서 시도명과 구/군/시 키워드를 추출해 측정소 후보를 고른다.
- API 실패 또는 값 없음 상태에서는 `--㎍/㎥`와 fallback 설명을 표시한다.
- Headless Chrome smoke에서 하단 metric이 `Fine Dust / Ultra Fine Dust / Rain / Wind`로 표시되고 `HUMIDITY` 중복이 사라진 것을 확인했다.
- 날씨 API가 429로 실패해도 하단 metric grid는 유지되도록 error gate를 분리했다.
- Live smoke에서 날씨 429 상태에서도 PM10/PM2.5 실측값과 Rain/Wind fallback이 함께 표시되는 것을 확인했다.
- PM10/PM2.5 설명의 기준 주소는 측정소명이 아니라 메인 날씨카드와 같은 표시 주소를 사용하도록 맞췄다. 측정소명은 데이터 선택 로직에만 사용한다.
- Live smoke에서 `서울특별시 중구 기준 미세먼지/초미세먼지`로 표시되는지 확인했다.
- 이후 표시 정책을 마지막 행정구역 토큰 기준으로 조정해 `복대동 기준 미세먼지 좋음`처럼 표시하도록 변경했다.

## 리스크

- 에어코리아 API는 별도 활용신청/운영 심의가 필요할 수 있다.
- 개발계정 트래픽이 낮아 캐시 없이 화면별 호출을 늘리면 한도에 빨리 도달할 수 있다.
- 행정구역명과 측정소명이 항상 1:1로 매칭되지 않는다.
