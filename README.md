# My_Weather_Bot

기상청 API를 활용한 날씨 예보 애플리케이션입니다.

## 프로젝트 실행 방법(로컬)

### 1) 사전 준비

- Node.js 22+
- npm 10+
- Cloudflare Wrangler (`npx wrangler ...` 방식 사용)

### 2) node module 설치

```bash
npm install
```

### 3) 로컬 환경변수 설정

- 루트 경로에 `.dev.vars` 파일을 생성합니다.
- API_KEY의 경우 메일로 안내 드리는 KEY 값을 이용해 주시면 되겠습니다.

```env
API_BASE_URL="https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0"
API_KEY="발급받은_서비스키"
```

### 4) 로컬 실행 (Worker + 정적 자산)

```bash
npm run dev:worker
```

### 5) 실행 이후 확인

- `/api/getVilageFcst?...` 응답이 `JSON`인지 확인

## 구현한 기능 설명

### 1) 현재 위치/선택 위치 날씨 조회
<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/1978957f-fe38-47a6-bd55-92bebbc2c825" />

- #1 입력창을 클릭하여 검색 화면으로 이동합니다.
- #2 날씨 정보를 조회합니다.
  - 현재 기온
  - 당일 최고/최저 기온
- #3 시간대별 기온을 조회합니다.

### 2) 지역 검색
<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/393d5776-a836-4e25-9c55-fade7619540f" />

- #1 시/군/구/동 단위 키워드로 지역 검색을 지원합니다.
- #2 검색 결과 선택 시 메인 화면으로 이동 후 해당 위치 날씨 조회합니다.
- #3 검색 화면에서 북마크 추가/삭제 기능을 이용할 수 있습니다.

<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/778ccf2e-fa94-4e17-864b-b7de4d20570f" />

- 일치하는 검색 결과가 없을 경우 메세지로 안내합니다.

### 3) 북마크
<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/cc07dd42-8034-43ca-a2cc-e065d95059fe" />

- #1 북마크에 대한 정보를 카드형태로 제공합니다.
  - 카드를 클릭하면 저장된 위치에 대한 정보를 조회할 수 있습니다.
  - 정보 조회는 메인화면에서 이뤄집니다.
- #2 날씨 정보를 구성해서 보여줍니다.
  - 지역명/별칭
  - 기상청 좌표(nx, ny)
  - 날씨 정보 (현재 기온, 최고/최저 기온)
- #3 북마크를 편집, 삭제할 수 있는 컨텍스트 메뉴 버튼입니다.   

<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/2e9e6885-08cd-4ec4-b6db-d06583032e69" />

- #1 별칭을 설정할 수 있는 입력폼입니다. 저장 버튼을 눌러 지정할 수 있습니다.

<img width="1451" height="824" alt="image" src="https://github.com/user-attachments/assets/743d4ce0-dda0-4855-ac8d-c4465eb1b603" />

- 등록된 북마크가 없을 경우 위와 같이 안내합니다.

### 4) API 프록시

- 브라우저에서 기상청 API 직접 호출 대신 Worker 프록시(`/api/*`)를 사용합니다.
- 서버 런타임에서 `API_KEY`를 주입합니다.

## 기술적 의사결정 및 이유

### 1) Cloudflare Worker 프록시 사용

- 배경:
  - Cloudflare Workers로 배포했을 때, 브라우저 직접 호출 시 CORS 이슈가 발생 했습니다.
  - 더불어 `API_KEY`가 노출되어 개발자 도구로 확인되는 문제가 있었습니다.
  - 따라서 Cloudflare Worker 프록시를 활용하기로 했습니다.
- 진행:
  - `src/worker.ts`에서 `/api/getUltraSrtNcst`, `/api/getVilageFcst` 프록시 처리
  - 환경변수(`API_KEY`)는 Worker 런타임에서만 사용
- 결과:
  - 프록시(`worker.ts`)를 활용해 CORS 이슈를 수정할 수 있었습니다.
  - 런타임에 환경변수를 주입해 주기 때문에 `API_KEY`가 노출되는 이슈를 수정할 수 있었습니다.

### 2) 전략 레지스트리 기반 API 호출 구조

- 배경:
  - API 타입별 파라미터/호출 방식이 다르며, 동일한 API 내에서도 파라미터에서 차이가 있는 걸로 확인했습니다.
    - 단기예보 API에서 시간대별 기온과 당일의 최저/최고 기온을 구할 때 예보 기준시각이 달라야 한다는 점이 이에 해당합니다. (`weatherDateTime.ts` 참고)
  - UI에서 API를 바로 호출하게 될 경우 파라미터/호출 방식 별로 분기문이 증가하게 되는 경우도 발생할 것으로 예상했습니다.
  - 따라서 JAVA 환경에서 사용하는 Handler 디자인 패턴에 착안해서 React 환경에 맞는 디자인 패턴을 조사 했습니다.
  - 조사 결과, 전략 레지스트리 기반의 API 호출 구조 알게 되어 이를 정의 및 적용하게 됐습니다.
- 진행:
  - 레지스트리(`weatherStrategyRegistry.ts`)에서 API 타입 단위로 `buildParams`와 `fetch`를 묶어서 캡슐화
    - `buildParams`: API 호출에 필요한 파라미터 빌더
    - `fetch`: API fetch 함수
  - 레지스트리에서 API를 가져오기 위해 Query 훅(`useWeatherQuery.ts`)을 구성 했고, 단일 Query로 구성하여 공통 진입점으로 고정
- 결과:
  - API 요청 흐름을 일원화 하여 기능 확장 시 수정 지점을 최소화하여 유지보수성을 높혔습니다.

### 3) Query 캐시/쿼리 키 설계

- 배경:
  - 기상청 API는 내부적으로 데이터 생성 시각과 API 제공 시각이 정해져 있습니다.
  - 예를 들면, 초단기실황 API는 매정각에 데이터를 생성하고 10분 뒤에 API로 제공합니다.
  - 실시간 데이터가 아니기 때문에 캐시를 활용하기 적절해 보였습니다.
  - 또한, 단일 Query를 사용하고 있는 점에서 캐시 키를 분리할 필요가 있었습니다.
- 진행:
  - 요청 키는 [`weather`, `apiType`, ...`params`] 형태로 구성해 타입/파라미터 기준 캐시로 분리
  - 공통 훅에서 `enabled`, `staleTime` 속성과 `refresh` 함수를 정의해 캐시 통제
- 결과:
  - 동일 조건 재조회 시 불필요한 네트워크 요청이 줄어 들었습니다.
  - `refresh` 함수를 통해 필요한 시점에서만 새로운 데이터를 조회하도록 했습니다.

### 4) 지역 검색 기능

- 배경:
  - korea_district.json을 기반으로 검색하며, API 조회를 위해서는 검색되는 지역의 좌표가 필요합니다.
  - 좌표는 기상청에서 지도를 나눠서 표현하는 것으로 가로세로 5km의 격자 무늬를 말합니다.
  - 따라서 지역명에 대한 좌표명을 조회할 수 있도록 제공해주신 json을 재구성해서 사용합니다.
- 진행:
  - `DistrictsGeoMapItem` 타입 정의 및 `korea_district_geo.json` 구성
    ```TypeScript
    export interface DistrictsGeoMapItem {
      nx: number;   // API 조회용
      ny: number;   // API 조회용
      lat: number;  // GPS 기반의 현재 위치명 조회용
      lon: number;  // GPS 기반의 현재 위치명 조회용
    }
    ```
  - `korea_district_geo.json` 기반으로 검색 인덱스를 생성하고, 공백/구분자를 제거하여 매칭 진행
  - 검색 결과는 매칭율(접두사/전체/행정단계) 기준으로 정렬 후 제한 개수(20)만 출력
  - 검색 결과 선택 시 `nx, ny`를 확정하고 메인 화면으로 이동해 위치 날씨를 조회
- 결과:
  - 지역명을 검색하여 날씨를 조회할 수 있습니다.
  - 관련 로직은 `useLocationSearch.ts`와 `locationSearch.ts`를 확인해 주시면 되겠습니다.

## 사용 기술 스택

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS v4
- uuid

### Infra / Deployment

- Cloudflare Workers (정적 자산 + API 프록시)
- Wrangler

### Data

- 기상청 단기예보 API (공공데이터포털)
