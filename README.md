# My_Weather_Bot

기상청 단기예보, Kakao Local/Maps, AirKorea API를 활용한 위치 기반 날씨 대시보드 애플리케이션입니다.

배포 URL

> https://my-weather-bot.xorb2298.workers.dev/

## 프로젝트 실행 방법(로컬)

### 1) 사전 준비

- Node.js 22+
- npm 10+
- Cloudflare Wrangler (`npm run dev:worker`, `npm run deploy`에서 `npx wrangler ...` 방식 사용)

### 2) node module 설치

```bash
npm install
```

### 3) 로컬 환경변수 설정

- 루트 경로에 `.dev.vars` 파일을 생성합니다.
- Vite dev proxy는 `.dev.vars`를 기본으로 읽고, `.env` 값이 있으면 `.env`가 우선합니다.

```env
API_BASE_URL="https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0"
API_KEY="발급받은_서비스키"
KAKAO_REST_API_BASE_URL="https://dapi.kakao.com"
KAKAO_REST_API_KEY="카카오_REST_API_키"
KAKAO_MAP_KEY="카카오_JavaScript_키"
AIRKOREA_API_BASE_URL="https://apis.data.go.kr/B552584/ArpltnInforInqireSvc"
# AIRKOREA_API_KEY="에어코리아_전용_서비스키" # 미지정 시 API_KEY 사용
```

> Vite 전용 prefix도 호환됩니다.
> `VITE_API_BASE_URL`, `VITE_API_KEY`, `VITE_KAKAO_REST_API_BASE_URL`, `VITE_KAKAO_REST_API_KEY`, `VITE_KAKAO_MAP_KEY`, `VITE_AIRKOREA_API_BASE_URL`, `VITE_AIRKOREA_API_KEY`

### 4) 로컬 실행

#### 빠른 프론트엔드 개발

```bash
npm run dev
```

- 기본 접속 주소: `http://localhost:5173`
- Vite dev proxy가 `/api/*`, `/api/kakao/*`, `/api/air-quality/*`, `/dapi.kakao.com/v2/maps/sdk.js` 요청을 로컬에서 프록시합니다.

#### Worker + 정적 자산 통합 확인

```bash
npm run dev:worker
```

- `npm run build` 이후 `npx wrangler dev`가 실행됩니다.
- 실제 Cloudflare Worker 배포 환경과 더 가까운 방식으로 확인할 때 사용합니다.

### 5) 실행 이후 확인

- `/api/getVilageFcst?...` 응답이 `JSON`인지 확인
- `/dapi.kakao.com/v2/maps/sdk.js?autoload=false` 응답이 내려오는지 확인

### 6) 품질 확인

```bash
npm test
npm run lint
npm run build
```

## 구현한 기능 설명 (v1.4)

v1.4에서는 Codex AI 에이전트를 활용해 로드맵 정리, UI 개선 방향 도출, 구현·검증 루프를 함께 진행했습니다.
이를 바탕으로 메인/검색/북마크 화면을 고도화하고, 강수·대기질·지도 정보를 기존 API 호출 흐름 안에서 확장했습니다.

### 1) 메인 화면

- 레이아웃을 개편 했습니다.
  - 데스크톱에서는 현재 날씨, 추천 카드, 시간대별 예보, 지표 카드, 지도/북마크 프리뷰를 한 화면에서 확인할 수 있습니다.
  - 모바일에서는 카드 단위로 자연스럽게 쌓이도록 반응형 레이아웃을 유지합니다.
- 현재 날씨 카드의 시각 정보를 강화했습니다.
  - 날씨 상태 아이콘, 현재 기온, 최고/최저 기온, 체감 온도, 습도, 풍속을 함께 표시합니다.
  - 새로고침 버튼으로 현재 선택 지역의 날씨를 다시 조회할 수 있습니다.
- 외출 준비 추천 카드를 추가했습니다.
  - 체감 온도, 습도, 풍속, 날씨 상태, 강수 확률을 기반으로 추천 문구와 준비물을 표시합니다.
- 시간대별 예보 카드에 강수 확률을 표시했습니다.
  - 물방울 아이콘과 퍼센트 텍스트를 함께 표시하고, 강수 확률 구간에 따라 색상 톤을 구분합니다.
  - 강수량(`PCP`)과 적설량(`SNO`) 수치 표시는 추후 확장 대상으로 남겨뒀습니다.
- 날씨 지표 카드를 확장했습니다.
  - 강수 확률, 풍속, 미세먼지/초미세먼지 정보를 카드 형태로 제공합니다.
  - 대기질 정보는 AirKorea API를 Worker 프록시로 조회합니다.
- 현재 지역 지도와 북마크 프리뷰를 메인 화면에서 확인할 수 있습니다.
  - 지도는 Kakao Maps SDK 기반으로 표시하며, 확대/축소 컨트롤을 제공합니다.
  - 북마크가 있는 경우 주요 북마크 날씨를 빠르게 확인할 수 있습니다.
   
> 메인 데스크톱 대시보드   
> <img width="1440" height="1889" alt="readme-v1 4-main-desktop" src="https://github.com/user-attachments/assets/d10f0268-1fd3-473d-9201-13f4a3f28458" />
   
> 메인 모바일   
> <img width="316" height="680" alt="스크린샷 2026-05-29 오전 1 05 43" src="https://github.com/user-attachments/assets/20c1b2f6-ae64-4b8c-a9d4-6e060c37320a" />
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 06 27" src="https://github.com/user-attachments/assets/07acf98b-4b81-41b9-bfae-7cf6cda756d6" />
> <img width="313" height="680" alt="readme-v1 4-main-mobile-iphone17pro-04" src="https://github.com/user-attachments/assets/19282148-f63a-4997-bc96-b93123ac08e2" />

> 시간대별 예보 강수 확률   
> <img width="752" height="280" alt="readme-v1 4-hourly-rain-chance" src="https://github.com/user-attachments/assets/cf6cbf66-7bc4-4c22-bde9-1d361bc30e6d" />
   
> 지도 확대/축소 컨트롤   
> <img width="752" height="376" alt="readme-v1 4-map-zoom-controls" src="https://github.com/user-attachments/assets/1e803072-51c0-4060-b138-a37dd92163ef" />


### 2) 검색 화면

- 검색 결과와 지도 확인 흐름을 개선했습니다.
  - 검색 결과의 대표 후보 위치를 지도에서 바로 확인할 수 있습니다.
  - 지도 표시/숨김 시 `fade`와 세로 위치 이동 애니메이션을 적용했습니다.
- 최근 검색 영역의 움직임을 자연스럽게 개선했습니다.
  - 지도가 나타날 때 최근 검색 영역이 아래로 밀리고, 지도가 사라질 때 위로 올라오도록 전환했습니다.
   
> 검색 결과와 지도 표시   
> <img width="1440" height="2838" alt="readme-v1 4-search-map" src="https://github.com/user-attachments/assets/49927317-942f-49e2-8930-2c302af7e42f" />
   
> 검색 화면 모바일   
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 12 25" src="https://github.com/user-attachments/assets/ae092df9-dedd-4216-83e7-eef9292aa036" />
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 12 37" src="https://github.com/user-attachments/assets/1b55b34b-1fab-4fad-8acc-3ed83f806b35" />
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 12 50" src="https://github.com/user-attachments/assets/bd644c56-7998-48d5-b9ce-f60b5dff42f5" />
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 13 00" src="https://github.com/user-attachments/assets/6781060c-84d2-45ce-bed3-2271ab9e1175" />

### 3) 북마크 화면

- 북마크 UI를 정리했습니다.
  - 저장한 지역을 카드 단위로 확인하고, 클릭 시 해당 지역 날씨를 메인 화면에서 조회할 수 있습니다.
  - 별칭 편집, 삭제, 빈 상태 안내를 제공합니다.
- 북마크 날씨 프리뷰를 고도화했습니다.
  - 단순 정적 아이콘 대신 단기예보의 날씨 상태를 기반으로 아이콘과 한글 상태명을 표시합니다.
  - 최고/최저 기온과 현재 상태를 함께 보여줘 북마크 목록에서 날씨 차이를 빠르게 비교할 수 있습니다.
- 북마크 화면에서도 지도/날씨 경험이 메인 화면과 같은 흐름을 사용하도록 정리했습니다.
   
> 북마크 목록 데스크톱   
> <img width="1440" height="1100" alt="readme-v1 4-bookmark-list" src="https://github.com/user-attachments/assets/561f4db8-e6bc-4ae5-8fca-7caa8d01b073" />
   
> 북마크 목록 모바일   
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 15 24" src="https://github.com/user-attachments/assets/b7bc45ef-51e9-4efb-aaaa-e42e0f523dff" />
> <img width="313" height="680" alt="스크린샷 2026-05-29 오전 1 15 34" src="https://github.com/user-attachments/assets/e16d2ee9-e014-4067-8509-07563921ca76" />


### 4) 공통 지도/API

- `KakaoRegionMap` 공통 컴포넌트로 지도 UI를 재사용합니다.
  - 메인 화면과 검색 화면에서 동일한 지도 표시 흐름을 사용합니다.
  - 지도 클릭 또는 `+`/`−` 버튼으로 확대/축소할 수 있습니다.
- Kakao Maps SDK를 Worker 프록시로 제공합니다.
  - 브라우저에서 필요한 지도 SDK를 `/dapi.kakao.com/v2/maps/sdk.js` 경로로 받아 사용합니다.
- 기상청 단기예보 파싱 범위를 확장했습니다.
  - `POP` 값을 활용해 강수 확률을 화면에 표시합니다.
  - `PCP`, `SNO` 값은 추천/주의 문구 확장 기반으로 보존하되, 화면의 수치 표시는 아직 적용하지 않았습니다.
   
> 지도 확대/축소 조작 상태   
> <img width="752" height="376" alt="readme-v1 4-map-zoom-controls" src="https://github.com/user-attachments/assets/e3e611c3-36fa-4405-869a-8b295d660891" />
   
> 대기질 지표 카드   
> <img width="752" height="230" alt="readme-v1 4-air-quality-cards" src="https://github.com/user-attachments/assets/af63bbbb-11dc-48fb-9bcf-42b5f1f6211e" />


## 구현한 기능 설명 (v1.3)

### 1) UI 개선

> Skeleton UI
> <img width="2906" height="1642" alt="image" src="https://github.com/user-attachments/assets/45216a1f-ffd4-40cc-93de-fcc36c83ab1b" />
> <img width="2906" height="1642" alt="image" src="https://github.com/user-attachments/assets/7483e58b-0a6e-41af-921e-200a78181985" />

> Error UI
> <img width="2906" height="1642" alt="image" src="https://github.com/user-attachments/assets/7b7360a7-7259-407f-9bd8-2ab9692ab1d7" />
> <img width="2906" height="1642" alt="image" src="https://github.com/user-attachments/assets/23216abe-b3b6-4abf-b242-ce54e223ca36" />

- ⚠️ 기상청 API 일일 트래픽 한도 초과 이슈를 확인했고, 이에 대한 개선이 필요해 보입니다.
  - Error UI를 적용하고 테스트하는 과정에서 확인한 이슈
  - 북마크 화면 진입 시, 북마크한 지역 수만큼 기상청 API 요청이 개별적으로 발생하고 있었음
  - 이는 API 요청 시 수치예보 모델 격자 좌표를 parameter로 전달해야 했고, 각 지역을 좌표와 1:1로 매핑하는 방식으로 처리하고 있었기 때문
  - 그 결과 예상보다 빠르게 일일 트래픽 한도에 도달했고, 일부 요청이 제한되는 문제가 발생
  - 위와 같은 이유로 개선 필요

## 구현한 기능 설명 (v1.2)

### 1) 주소 검색 방식 개선

> 검색 예시: 서울특별시 종로구
> <img width="1456" height="832" alt="image" src="https://github.com/user-attachments/assets/a78c5f6a-56df-4fbe-b4be-f3cc81c67dd0" />

> 검색 예시: **사**울특별시 종로구
> <img width="1456" height="832" alt="image" src="https://github.com/user-attachments/assets/9c4826b6-01d5-437c-9110-ca455f055696" />

> 검색 예시: 로구 청
> <img width="1453" height="821" alt="image" src="https://github.com/user-attachments/assets/4046d174-7660-4a07-81d1-aaa6a2256d89" />

- #1 Kakao Local API(주소→좌표 변환)를 연동하여 정적 데이터셋 의존성을 제거했습니다.
  - ✅ Kakao Local API(주소→좌표 변환)를 연동하여 입력된 주소로 좌표를 직접 구함
  - ✅ 좌표 데이터를 지니고 있는 정적 데이터 `DistrictsGeoMapItem` 타입 제거
- #2 Fuse.js 라이브러리를 도입하여 부분 검색 기능을 개선했습니다.
  - ✅ 오타 허용
  - ✅ 글자 단위의 부분 검색 허용
  - ✅ 일치하는 글자에 하이라이트
- #3 자주 검색되는 지역명에 대해선 캐시 및 TTL 적용하여 좌표 계산 비용 절약
  - ✅ localStorage에 캐시 저장
  - ✅ 지역명→위/경도 TTL: 7일
  - ✅ 위/경도→수치예보 모델 격자 좌표 TTL: 30일  
    ※ 위/경도 정보는 지역명에 비해 변동성이 낮으므로 더 오래 유지해도 무방함

- 기존 버전은 지역명-좌표 데이터를 key-value의 쌍으로 정의하고 있었습니다.

  ```TypeScript
    export interface DistrictsGeoMapItem {
      nx: number;   // API 조회용
      ny: number;   // API 조회용
      lat: number;  // GPS 기반의 현재 지역명 조회용
      lon: number;  // GPS 기반의 현재 지역명 조회용
    }
  ```

  - 위/경도, 수치예보 모델 격자 좌표가 데이터셋 크기가 크고 유지 비용이 높음
  - 지역명과 좌표 데이터가 강하게 결합되어 있음
  - 지역명 또는 좌표 데이터의 기준 변경에 매우 취약
  - 이러한 이유로 Kakao Local API를 연동하여 정적 데이터셋에 대한 의존성을 제거했습니다.

- 검색 기능을 이용하는 데에 있어 다소 불편한 점을 개선했습니다.
  - 입력 도중 발생하는 오타도 어느 정도 허용
  - 단어 단위가 아닌 글자 단위로 검색
  - 실시간 검색 및 생성된 후보 리스트 중 일치 데이터에 하이라이트
  - Fuse.js 라이브러리를 통해 개선할 수 있었습니다.

- 캐시 및 TTL을 적용해 반복 조회 시 API 호출 비용을 절감했습니다.
  - 지역명, 위/경도, 수치예보 모델 격자 좌표 등은 변동성이 매우 낮은 데이터
  - 동일한 요청에 대해 동일한 결과를 기대할 수 있어 캐시 전략을 적용하기 적절
  - 그 결과, 불필요한 외부 API 호출을 줄이고 검색 응답 속도를 개선할 수 있었습니다.

## 구현한 기능 설명 (v1.1)

### 1) 현재 위치/선택 위치 날씨 조회

<img width="1456" height="832" alt="image" src="https://github.com/user-attachments/assets/c7dcaf2a-cbc6-4201-8881-d479acc2e71b" />

- #1 추가된 날씨 정보를 조회할 수 있도록 기능을 확장했습니다.
  - 현재 기온
  - 당일 최고/최저 기온
  - ✅ 현재 위치 지역명
  - ✅ 현재 위치의 기상 상태(강수, 구름 등)
  - ✅ 체감 온도
  - ✅ 습도
- #2 시간대별 날씨 정보를 조회할 수 있도록 개선했습니다.
  - 기온
  - ✅ 기상 상태(강수, 구름 등)

- 현재 위치의 지역명 조회를 위해 Kakao Local API(좌표→행정구역 변환)를 연동했습니다.
- 데이터 조회 흐름
  <img width="819" height="494" alt="image" src="https://github.com/user-attachments/assets/e91a533c-84c3-4c19-a2d3-4223a0eaaf73" />

- 전체 UI를 개편하여 디자인을 개선했습니다.
  (단, 로딩 인디케이터 등 일부 세부 UI 조정은 추후 진행 예정)
- 지역명 우측에 새로고침 버튼을 추가하여 날씨 정보를 즉시 재조회할 수 있도록 개선했습니다.
- 시간대별 날씨 정보에 x축 스크롤 및 드래그를 추가하였습니다.

## 구현한 기능 설명 (v1.0)

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

### 2) Kakao Local API를 통한 현재 위치 지역명 조회

- 배경:
  - 브라우저 geolocation은 위/경도만 제공하고, 기상청 api는 지역명을 제공하지 않습니다.
  - 따라서 현재 위치의 지역명을 얻기 위해서는 별도의 방법이 필요합니다.
  - 다행히 [kakao map api(좌표로 행정구역정보 변환)](https://developers.kakao.com/docs/latest/ko/local/dev-guide#coord-to-district)을 활용해 구할 수 있었습니다.
- 진행:
  - 브라우저 geolocation으로 위/경도를 구하고, kakao map api에 파라미터로 담아서 요청을 보냅니다.
  - 응답에서 법정동(B)에 해당하는 지역명을 조합해 사용합니다.
- 결과:
  - 메인화면에서 지역명을 출력할 수 있게 됐습니다.

### 3) 전략 레지스트리 기반 API 호출 구조

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
  - API 요청 흐름을 일원화 하여 기능 확장 시 수정 지점을 최소화하여 유지보수성을 높였습니다.

### 4) Query 캐시/쿼리 키 설계

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

### 5) Kakao Local API + Fuse.js 기반 지역 검색

- 배경:
  - 기존 정적 좌표 데이터셋은 지역명, 위/경도, 기상청 격자 좌표가 강하게 결합되어 유지보수 비용이 높았습니다.
  - 검색어 입력 중 오타, 부분 입력, 행정구역 단계 차이를 더 유연하게 처리할 필요가 있었습니다.
- 진행:
  - Kakao Local API(주소 → 좌표 변환)를 통해 검색어의 위/경도를 조회합니다.
  - 조회한 위/경도는 기상청 격자 좌표로 변환해 날씨 API 요청에 사용합니다.
  - Fuse.js 기반 검색 엔진으로 부분 검색, 오타 허용, 일치 텍스트 하이라이트를 처리합니다.
  - 지역명/좌표/격자 변환 결과는 localStorage TTL 캐시로 재사용합니다.
- 결과:
  - 정적 좌표 데이터셋 의존도를 낮추고, 검색 UX와 반복 조회 성능을 개선했습니다.
  - 관련 로직은 `src/features/location-search/useLocationSearch.ts`, `src/shared/lib/location-search.engine.ts`, `src/shared/lib/location-search.lib.ts`를 확인해 주시면 되겠습니다.

### 6) Worker 기반 외부 API 프록시 확장

- 배경:
  - 날씨 외에도 Kakao Local API, Kakao Maps SDK, AirKorea API를 함께 사용하게 되면서 브라우저 CORS와 API 키 노출을 일관되게 막을 필요가 있었습니다.
- 진행:
  - 기상청 API는 `/api/*` 경로로 프록시합니다.
  - Kakao Local API는 `/api/kakao/*` 경로로 프록시합니다.
  - Kakao Maps SDK는 `/dapi.kakao.com/v2/maps/sdk.js` 경로로 프록시합니다.
  - AirKorea API는 `/api/air-quality/*` 경로로 프록시합니다.
- 결과:
  - 브라우저에는 API 키를 직접 노출하지 않고, 로컬/Vite/Worker 환경에서도 같은 경로 구조로 외부 API를 사용할 수 있습니다.

## 사용 기술 스택

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS v4
- Fuse.js
- uuid

### Infra / Deployment

- Cloudflare Workers (정적 자산 배포 + API 프록시)

### Data / External API

- 기상청 단기예보 API (공공데이터포털)
- Kakao Local API (주소 → 좌표 변환, 좌표 → 행정구역 변환)
- Kakao Maps SDK
- AirKorea API (미세먼지/초미세먼지)

### Client Storage

- localStorage
