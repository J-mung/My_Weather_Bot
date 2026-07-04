## 기상청 초단기실황조회 API - 현재 날씨

### 소개

- 1시간 간격으로 발표되는 현재 날씨 정보
- Request 데이터 **(상세 형식은 배포 문서 참고)**
  - serviceKey: API 서비스 키
  - numOfRows: 한 페이지 결과 수
  - pageNo: 페이지 번호
  - dataType: 응답자료형식
  - base_date: 발표일자
  - base_time: 발표시각
  - nx: 예보지점 X 좌표
  - ny: 예보지점 Y 좌표
- nx와 ny를 위치 데이터로 활용해 날씨 정보를 응답해주는 형식

### 위치 확인 이슈

- 기상청 배포 문서에서 격자\_위경도.xlsx 파일이 있음
- 행정구역코드를 PK로 정의해서 데이터를 저장하는 형태인 것 같음
- 이때 nx와 ny로는 기초자치단체, 시군구까지만 확인할 수 있고 동 이하부터는 확인이 어려운 것으로 보임
- 중복되는 (nx, ny) 조합이 확인 됐기 때문
- 위경도를 함께 사용하면 지역을 정확하게 구별할 수 있을 것 같으나 API 스펙이 지원하지 않음
  - 예보는 격자 셀 단위라서, 행정구역 중심점(동사무소 중심 등)을 기준으로 잡더라도
  - 여러 동이 같은 격자 셀에 들어갈 수 있음
- 이런 이유로 "동 이름"은 표시/검색 편의용 데이터를 활용하고 예보조회는 (nx, ny) 사용

### nx, ny 구하기

- 현재 위치를 의미하는 nx, ny를 구할 필요가 있음
- 함수는 [navigator.geolocation.getCurrentPosition](https://developer.mozilla.org/ko/docs/Web/API/Geolocation/getCurrentPosition) 사용하면 됨
- 그러나.. 위경도를 반환해주기 때문에 nx, ny를 구하기 위해 변환 작업이 필요
  - 에보지점 X 좌표, Y 좌표 (nx, ny)는 전국을 5km \* 5km 간격의 격자로 나눠 좌표화한 것
- 변환 메서드 구현하기

### 발표일자, 발표시각 구하기

- 발표일자 예시: 20260227 (2026년 02월 27일)
- 발표시각 예시: 2000 (20시 정각)
- 기상청 내부에서 1시간 간격으로 정각에 데이터를 생성하고, 그로부터 10분 뒤에 API로 데이터를 제공함
- Date 객체에서 발표일자와 발표시각을 구하는 메서드 구현하기

---

## 한국천문연구원 출몰시각 정보 API - 일출/일몰

### 소개

- 공공데이터포털 `한국천문연구원_출몰시각 정보`를 사용해 오늘의 일출/일몰 시각을 조회한다.
- 1차 구현은 지역명 기반 `getAreaRiseSetInfo`를 사용한다.
- API 키는 프론트에 노출하지 않고 Worker에서 `serviceKey`를 주입한다.

### 로컬/배포 환경 변수

로컬 Vite 개발 환경에서 사용자가 `.env`에 기록한 값:

```bash
VITE_RISE_SET_API_BASE_URL=https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService
VITE_RISE_SET_API_KEY=공공데이터포털_일반_인증키_Decoding
```

주의: 로컬 Vite 개발 서버는 `VITE_RISE_SET_API_BASE_URL`을 dev proxy의 upstream으로 읽고, `VITE_RISE_SET_API_KEY`를 upstream 요청의 `serviceKey`로 주입한다. 프로덕션에서는 클라이언트가 이 값을 직접 읽지 않고 Worker가 서버 측 환경 변수 `RISE_SET_API_KEY`로 주입하는 구조가 안전하다. 로컬 Worker 프록시를 함께 실행할 때는 `.dev.vars`에도 다음 값을 둔다.

```bash
RISE_SET_API_KEY=공공데이터포털_일반_인증키_Decoding
```

Cloudflare Pages/Worker 환경 변수:

```bash
RISE_SET_API_KEY=공공데이터포털_일반_인증키_Decoding
```

CLI로 설정할 때:

```bash
npx wrangler secret put RISE_SET_API_KEY
```

`wrangler.toml`에는 secret이 아닌 base URL만 둔다.

```toml
RISE_SET_API_BASE_URL = "https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService"
```

### 키 발급

1. 공공데이터포털에 로그인한다.
2. `한국천문연구원_출몰시각 정보` 페이지에서 `활용신청`을 진행한다.
3. 승인 후 마이페이지/활용신청 상세에서 `일반 인증키(Decoding)` 값을 복사한다.
4. Worker가 `URLSearchParams`로 인코딩하므로 Encoding 키보다 Decoding 키를 환경 변수에 넣는 것을 권장한다.

### 요청 파라미터

- `locdate`: `YYYYMMDD`
- `location`: 지역명. 예: `서울`, `부산`, `수원`

### UI 정책

- API 실패는 전체 날씨 화면 실패로 전파하지 않는다.
- 실패 시 일출/일몰 카드만 `--:--`와 안내 문구를 표시한다.
- 아크 라인 차트는 실제 천문 고도 계산이 아니라 낮 시간 진행을 설명하는 시각화다.
