# 운영 관측 및 장애 점검 가이드

MyWeatherBot v1.5 운영 안정화 기준 문서입니다. 배포 후 외부 API, Worker cache, 위치 권한 오류를 빠르게 분류하기 위해 관측해야 할 신호와 점검 순서를 정의합니다.

## 1. 관측 대상

| 영역 | 경로/기능 | 주요 신호 | 정상 기준 |
| --- | --- | --- | --- |
| 기상청 날씨 proxy | `/api/getUltraSrtNcst`, `/api/getUltraSrtFcst`, `/api/getVilageFcst` | `X-Weather-Cache`, `Cache-Control`, 앱 오류 코드 `MWB-WEATHER-*` | 동일 요청 반복 시 `MISS` 이후 `HIT` 가능, HTTP 200이어도 KMA `resultCode=00` 필요 |
| AirKorea proxy | `/api/air-quality/getCtprvnRltmMesureDnsty` | `X-Air-Quality-Cache`, 앱 오류 코드 `MWB-AIRQUALITY-*` | AirKorea `resultCode=00` 응답만 cache 저장 |
| Radar proxy | `/api/radar/composite-image` | `X-Radar-Cache`, `X-Radar-Tm`, `X-Radar-Observed-At-KST`, 앱 오류 코드 `MWB-RADAR-*` | 이미지 응답이면 `Content-Type=image/*`, 관측 시각 헤더 존재 |
| Kakao 위치 조회 | `/api/kakao/coord2regioncode`, `/api/kakao/search/address`, `/api/kakao/search/keyword` | 앱 오류 코드 `MWB-LOCATION-*` | 국내 좌표는 행정구역명 반환, 서비스 영역 밖은 `MWB-LOCATION-105` |
| 브라우저 위치 권한 | `navigator.geolocation` | `MWB-LOCATION-001~004`, 권한 상태 `granted/prompt/denied` | 권한 허용 후 좌표→지역명→격자 변환 성공 |

## 2. Cache 헤더 해석

| 값 | 의미 | 조치 |
| --- | --- | --- |
| `HIT` | Worker cache에서 응답 제공 | 정상. 오래된 데이터 의심 시 TTL 정책 확인 |
| `MISS` | upstream 호출 성공 후 cache 저장 대상 | 정상. 같은 요청 반복 시 `HIT` 전환 여부 확인 |
| `BYPASS` | cache 미사용 또는 저장 제외 | 오류 payload, TTL 0, cache 미지원 환경 여부 확인 |

관련 구현 위치:

- Weather: `src/worker/weather.ts`, `src/entities/weather/model/weather-cache-policy.ts`
- AirQuality: `src/worker/air-quality.ts`
- Radar: `src/worker/radar.ts`
- Cache adapter: `src/worker/cache.ts`

## 3. 빠른 점검 절차

### 3.1 날씨 데이터가 비어 있거나 카드가 에러인 경우

1. 브라우저 또는 `curl -i`로 Weather proxy 응답 헤더 확인
   - `X-Weather-Cache`
   - `Cache-Control`
2. 응답 body의 KMA `response.header.resultCode` 확인
   - `00`: 앱 mapper 입력 shape 확인
   - `03` 또는 `NO_DATA`: `MWB-WEATHER-*-102/302` 계열로 분류되어야 함
   - `99` 등 서비스 오류: `MWB-WEATHER-*-103/303` 계열로 분류되어야 함
3. `body.items.item`이 없거나 빈 배열이면 fetcher 단계에서 AppError로 전환되는지 확인
   - 보호 테스트: `src/entities/weather/api/weather-api-response.test.ts`

### 3.2 현재 위치가 계속 실패하는 경우

1. Chrome 사이트 위치 권한과 macOS 위치 서비스 권한을 각각 확인
2. 앱 오류 코드 확인
   - `MWB-LOCATION-001`: 브라우저 사이트 권한 거부
   - `MWB-LOCATION-002`: 기기/브라우저가 좌표를 제공하지 못함
   - `MWB-LOCATION-003`: 좌표 확인 시간 초과
   - `MWB-LOCATION-004`: 앱의 재시도 제한 도달
   - `MWB-LOCATION-105`: Kakao 서비스 영역 밖 또는 국내 행정구역 미확인 좌표
3. `MWB-LOCATION-004` 이후에는 `/error?reason=location-request-limit` 페이지 안내를 기준으로 지역 검색 우회가 가능해야 함
4. 공통 hook 확인 위치: `src/features/location-current/model/useCurrentLocationRegion.ts`

### 3.3 Radar 이미지가 표시되지 않는 경우

1. `X-Radar-Cache`, `X-Radar-Tm`, `X-Radar-Observed-At-KST` 헤더 확인
2. `MWB-RADAR-001`: runtime config/proxy path 문제
3. `MWB-RADAR-002`: upstream HTTP 실패
4. `MWB-RADAR-003`: 응답 format 문제
5. 보호 테스트: `src/worker/radar.test.ts`, `src/entities/weather/api/fetchRadarCompositeImage.test.ts`

## 4. 배포 후 스모크 체크리스트

- [ ] 메인 화면: 현재 위치 권한 `prompt` 상태에서 권한 요청 모달이 표시된다.
- [ ] 메인 화면: 권한 허용 후 현재 위치 날씨/지도/대기질 카드가 표시된다.
- [ ] 메인 화면: 위치 요청 반복 실패 시 `/error?reason=location-request-limit`로 이동한다.
- [ ] 북마크 화면: 현재 위치 카드가 성공/로딩/에러 레이아웃 중 하나로 표시된다.
- [ ] 날씨 proxy: 동일 요청 2회 이상에서 `X-Weather-Cache`가 `MISS` 또는 `HIT`로 관측된다.
- [ ] AirQuality proxy: 정상 payload만 cache 저장된다.
- [ ] Radar proxy: 이미지와 관측 시각 헤더가 함께 내려온다.
- [ ] ErrorCode는 사용자에게 안전한 `MWB-*` 코드만 표시하고 환경변수명/키 이름을 노출하지 않는다.

## 5. 조정 기준

| 신호 | 판단 | 조정 후보 |
| --- | --- | --- |
| `MISS` 비율이 지속적으로 높음 | cache key가 과도하게 세분화됐거나 TTL이 짧음 | `weather-cache-policy.ts`, Worker cache key 정규화 확인 |
| `BYPASS`가 정상 응답에도 반복 | cache 조건이 너무 엄격함 | upstream 정상 판정 로직 확인 |
| `MWB-LOCATION-104` 증가 | Kakao 응답 shape 또는 분류 누락 가능성 | `fetchRegionNameFromCoord` 분류 테스트 추가 |
| `MWB-LOCATION-105` 증가 | 실제 사용 좌표가 서비스 영역 밖이거나 브라우저 좌표 품질 문제 | 지역 검색 우회 안내 강화, 진단 좌표 표시 후보 검토 |
| `MWB-WEATHER-*-102/302` 증가 | KMA 발표 시각/좌표/요청 base time 문제 가능성 | base time 계산과 `numOfRows` 확인 |

## 6. 변경 시 검증 명령

```bash
npm run lint
npm run test
npm run build
```

운영 정책 또는 오류 분류를 변경할 때는 관련 테스트를 먼저 추가/수정한 뒤 위 검증을 통과해야 합니다.
