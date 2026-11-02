# Minkyung Gwak · Portfolio

정보학, 데이터 분석, UX 리서치, 프로덕트 매니지먼트를 하나로 묶은 개인 포트폴리오 사이트예요.
빌드 도구 없이 HTML, CSS, JavaScript만 써서 GitHub Pages에 그대로 올릴 수 있어요.

## 구성

```
minkyung-portfolio/
├── index.html                  # 모든 섹션의 내용
├── css/
│   └── style.css               # 색상, 글꼴, 레이아웃 (맨 위 :root 에서 테마 변경)
├── js/
│   └── main.js                 # 테마, 직무 보기, 탭, 대시보드, 필터, 복사 버튼
├── assets/
│   └── Minkyung_Gwak_CV.docx   # 이력서 다운로드 파일
├── .nojekyll                   # GitHub Pages가 파일을 그대로 서빙하게 해요
└── README.md
```

## 섹션

| 섹션 | 내용 |
| --- | --- |
| Hero | 한 줄 소개, 직무별 보기(PM, UX Researcher, BI Analyst), 핵심 숫자 4개 |
| About | 관점 3가지와 짧은 소개 |
| Experience | Rayence, LG Chem, Saramin HR, Hite Jinro |
| Case studies | 예측 오차 개선, 고객 피드백과 성형 불량, 도서 레코드 정제 |
| Dashboards | 예측 오차, 월별 불량, 고객 피드백 주제 (필터와 표 보기) |
| Skills | 분야별 스킬, 직무를 고르면 관련 스킬이 강조돼요 |
| Beyond the job | 해커톤 대상, 동아리 협찬, 모의유엔, 봉사와 교육 활동 (필터) |
| Education | 학력, 자격, 수상 |
| Résumé | 요약과 .docx 다운로드 |
| Contact | 이메일 복사, LinkedIn |

## 내 컴퓨터에서 보기

```bash
cd minkyung-portfolio
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 을 열어요
```

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소를 만들어요. 계정이름.github.io 로 만들면 주소가 `https://계정이름.github.io` 가 돼요.
2. 이 폴더의 파일을 저장소 맨 위(루트)에 올려요.
3. 저장소의 Settings > Pages 로 가요.
4. Source를 Deploy from a branch, Branch를 main, 폴더를 / (root) 로 두고 Save를 눌러요.
5. 1~2분 뒤 안내된 주소로 접속해요.

## 내용 고치기

- 문구와 경력: `index.html` 에서 해당 섹션을 찾아 고쳐요. 섹션마다 `id` 가 붙어 있어요.
- 색상과 글꼴: `css/style.css` 맨 위 `:root` 의 값만 바꾸면 사이트 전체에 적용돼요. `:root[data-theme="light"]` 는 라이트 모드 값이에요.
- 이력서 파일: `assets/Minkyung_Gwak_CV.docx` 를 같은 이름으로 교체해요.
- 연락처: `index.html` 의 Contact 섹션에서 이메일과 LinkedIn 주소를 바꿔요.

## 대시보드 데이터에 대해

대시보드 3개는 샘플 데이터예요. 회사 내부 자료는 공개할 수 없어서, 이력서에 적은 결과(예측 오차 25%에서 10%, 불량 45건에서 10건 미만, 고객 240명 이상)에 맞춰 중간 값을 만들었어요. 페이지에도 샘플 데이터라고 표시해 두었어요.
실제 공개 가능한 데이터로 바꾸려면 `js/main.js` 의 `ERR`, `CATS`, `THEMES` 배열을 고쳐요.

## 개인정보

사이트에는 이메일, LinkedIn, 거주 도시(일산)만 들어 있어요. 전화번호와 상세 주소는 넣지 않았어요. 올리기 전에 한 번 더 확인해 주세요.

## 사용한 것

- 글꼴: Bricolage Grotesque, Hanken Grotesk, IBM Plex Mono (Google Fonts)
- 외부 라이브러리 없음
