### 배경

현재 검색 기능은 지역명과 함께 `nx`, `ny`, `lat`, `lon`을 모두 포함한 정적 데이터셋에 의존하고 있다.

이 방식은 빠르게 지역을 검색하고 즉시 날씨 조회를 연결하는 데는 유리하지만,
다음과 같은 한계가 있다.

- 데이터셋 크기가 크고 유지 비용이 높다.
- 검색용 데이터와 좌표 변환용 데이터가 강하게 결합되어 있다.
- 좌표나 행정구역 기준이 바뀔 때 전체 데이터셋을 다시 관리해야 한다.

따라서 검색용 최소 데이터만 유지하거나,
가능하면 검색 후보용 문자열 사전만 사용하고,
좌표와 격자 좌표는 런타임에 계산하는 구조로 전환할 필요가 있다.

### 목표

1. 지역 검색 UX를 유지하거나 개선한다.
2. `nx`, `ny`, `lat`, `lon`이 포함된 무거운 정적 데이터셋 의존을 제거한다.
3. 선택된 지역에 대해서만 외부 API 호출과 격자 변환을 수행한다.
4. 외부 Geocoding API 호출 비용을 캐시로 줄인다.
5. 기존 날씨 조회 구조(`nx`, `ny` 기반 조회)는 그대로 재사용한다.

### 전제

- 검색용 최소 지역명 사전은 [korea_districts.json](/Users/J_mung/Works/ToyProjects/My_Weather_Bot/src/shared/lib/korea_districts.json)을 사용한다.
- fuzzy search 품질 향상을 위해 Fuse.js를 도입한다.
- 선택된 지역의 좌표는 Kakao Geocoding API로 조회한다.
- 조회된 위도/경도는 기상청 격자 좌표(`nx`, `ny`)로 변환한다.
- 캐시는 TTL 기반 영속 캐시로 관리한다.

### 최종 아키텍처

```txt
검색 입력
  -> 지역명 사전(Fuse.js) 검색
  -> 후보 목록 표시
  -> 사용자 선택
  -> region -> lat/lon 캐시 조회
     -> miss: Kakao Geocoding API 호출
  -> lat/lon -> grid 캐시 조회
     -> miss: 기상청 격자 변환 계산
  -> nx, ny 획득
  -> 기존 Weather API 조회
```

### 검색 구조

#### 1. 검색 후보 데이터

검색 후보는 문자열 배열 기반으로 유지한다.

예:

- `서울특별시`
- `서울특별시-종로구`
- `서울특별시-종로구-청운동`

이 데이터는 검색 품질을 위한 인덱스 용도로만 사용하며,
이 단계에서 좌표 정보는 포함하지 않는다.

#### 2. 검색 엔진

Fuse.js를 사용해 fuzzy search를 수행한다.

선정 이유:

- 부분 검색 지원
- 오타 허용 가능
- ranking 제공
- 2만 건 내외 문자열 목록을 client-side에서 처리하기에 충분히 빠름

#### 3. 검색 결과 선택 이후 처리

검색 결과를 선택하면 해당 문자열을 기준으로 Geocoding을 수행한다.
입력 중에는 외부 API를 호출하지 않고,
선택된 항목에 대해서만 1회 호출하는 구조를 유지한다.

### 좌표 변환 구조

#### 1. Region -> LatLng

사용자가 선택한 문자열을 Kakao Geocoding API로 전달하여 위도/경도를 획득한다.

예:

```ts
{
  lat: 37.5796,
  lon: 126.9706,
}
```

#### 2. LatLng -> GridCoord

획득한 위도/경도를 [convertToGridcoord.ts](/Users/J_mung/Works/ToyProjects/My_Weather_Bot/src/shared/lib/convertToGridcoord.ts) 기반으로 변환한다.

예:

```ts
{
  nx: 60,
  ny: 127,
}
```

이 결과는 기존 날씨 조회 훅과 API 계층에서 그대로 사용할 수 있다.

### 캐시 전략

이번 구조의 핵심은 두 단계 캐시다.

#### 1. Region -> LatLng 캐시

목적:

- 같은 지역명을 반복 검색할 때 Kakao API 호출을 줄인다.
- 외부 API rate limit 부담을 줄인다.

캐시 키는 입력 문자열 그대로 쓰지 않고,
공백과 대소문자 차이를 줄인 정규화된 문자열을 사용한다.

예:

```ts
const normalizeRegionKey = (region: string) => region.trim().replace(/\s+/g, " ").toLowerCase();
```

#### 2. LatLng -> Grid 캐시

목적:

- 동일하거나 매우 가까운 좌표에 대해 격자 계산을 반복하지 않는다.

캐시 키 예:

```ts
const getGridKey = (lat: number, lon: number) => `${lat.toFixed(4)}_${lon.toFixed(4)}`;
```

### TTL 영속 캐시 정책

#### 1. 이유

메모리 캐시는 구현이 단순하지만 새로고침 시 초기화된다.
이번 구조에서는 Geocoding 결과가 비교적 안정적이므로,
브라우저 재방문 시에도 캐시를 재사용할 수 있는 영속 캐시가 적절하다.

#### 2. 저장 위치

우선순위는 다음과 같다.

1. `localStorage`
2. 필요 시 `IndexedDB` 확장 검토

초기 구현은 `localStorage`로 충분하다.

#### 3. TTL 적용 방식

캐시 엔트리는 값과 저장 시각을 함께 보관한다.

예:

```ts
interface CachedValue<T> {
  value: T;
  savedAt: number;
}
```

TTL 예시는 다음과 같다.

- `region -> lat/lon`: 7일
- `lat/lon -> grid`: 30일 또는 더 길게 유지 가능

이유:

- Geocoding 결과는 비교적 안정적이지만, 주소 체계 변경 가능성을 완전히 배제할 수는 없다.
- Grid 변환은 계산 규칙이 바뀌지 않는 한 매우 안정적이다.

#### 4. 만료 정책

조회 시 다음 순서로 처리한다.

1. storage에서 값 조회
2. `savedAt` 확인
3. TTL 초과 시 삭제 후 miss 처리
4. miss면 새 값 계산 후 저장

### 예시 흐름

```ts
검색어 입력
-> Fuse 검색 결과 표시
-> 사용자가 "서울특별시 종로구 청운동" 선택
-> region cache 조회
   -> miss
-> Kakao Geocoding API 호출
-> lat/lon 획득 후 region cache 저장
-> grid cache 조회
   -> miss
-> convertToGridcoord 실행
-> nx, ny 저장
-> Weather API 조회
```

재검색 시:

```ts
동일 지역 선택
-> region cache hit
-> grid cache hit
-> Weather API 바로 조회
```

### 구현 순서

1. `korea_districts.json` 기반 Fuse 검색 인덱스 구성
2. 검색 훅을 Fuse 기반으로 교체 또는 확장
3. Kakao Geocoding 호출 함수 추가
4. `region -> lat/lon` TTL 캐시 유틸 추가
5. `lat/lon -> grid` TTL 캐시 유틸 추가
6. 선택된 검색 결과에서 `nx`, `ny`를 계산하는 흐름 연결
7. 기존 날씨 조회 흐름과 연결
8. 실패/빈 결과 메시지 정리

### 고려 사항

#### 1. 외부 API 호출 시점

입력 중에는 호출하지 않고,
반드시 사용자가 후보를 선택한 뒤에만 Geocoding을 수행한다.

#### 2. 실패 처리

다음 케이스를 분리해서 처리해야 한다.

- 검색 후보 없음
- Geocoding 실패
- Grid 변환 실패
- Weather 조회 실패

#### 3. 캐시 무효화

TTL 만료 외에도,
데이터 구조가 바뀌면 버전 키를 변경해 강제로 캐시를 초기화할 수 있어야 한다.

예:

```ts
const GEO_CACHE_KEY = "geo-cache:v1";
const GRID_CACHE_KEY = "grid-cache:v1";
```

#### 4. Worker 프록시 유지

Kakao API는 브라우저에서 직접 호출하지 않고,
기존 Worker 프록시 구조를 유지하는 것이 맞다.

### 한 줄 요약

검색은 지역명 사전 + Fuse.js로 처리하고,
선택된 결과에 대해서만 Geocoding과 기상청 격자 변환을 수행하며,
그 결과는 TTL 기반 영속 캐시로 최적화하는 구조를 채택한다.
