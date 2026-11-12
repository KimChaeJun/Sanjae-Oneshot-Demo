# 산재원샷 인터랙티브 데모

[체험 시작하기](https://kimchaejun.github.io/Sanjae-Oneshot-Demo/)

산재원샷 실제 프런트엔드의 디자인과 화면을 활용한 GitHub Pages 체험판입니다. 회원가입과 서버 연결 없이 예시 정보로 전체 신청 준비 흐름을 확인합니다.

## 체험 흐름

시작 안내 → 대시보드 → 기본 정보 → 사고 정보 → 예시 서류 → 필요 서류 확인 → OCR 예시 → AI 초안 예시 → 검토 → 직접 수정 및 최종 확인 → 완료 및 결과 화면 미리보기

- 이름·회사·사고·서류는 합성 시연 데이터입니다.
- 이전/다음, 브라우저 뒤로/앞으로, 마이페이지, 신청 이어보기, 언어 변경과 노인친화형 UI를 체험할 수 있습니다.
- 서류 선택 버튼은 준비된 예시 자료를 불러옵니다. 실제 파일 선택이나 업로드를 하지 않습니다.
- API 요청은 `src/demo/transport.ts`에서 브라우저 메모리로 처리합니다. 외부 API·DB·OCR·AI에 연결하지 않습니다.
- OCR·AI 문장과 점수는 고정 예시입니다. 입력값을 바꾸어도 실제 분석은 수행하지 않습니다.
- 최종 결과는 화면 미리보기로 표시하며 PDF 생성·다운로드·공식 접수는 수행하지 않습니다.
- 체험 내용은 새로고침하면 초기화됩니다. UI 언어·접근성 선호도만 브라우저에 유지됩니다.
- 근로복지공단의 공식 서비스가 아니며 산재 인정 여부나 승인 가능성을 판단하지 않습니다.

## 로컬 실행

Node.js 24를 사용합니다.

```sh
npm ci
npm run dev
```

개발 서버 주소 뒤에 `/Sanjae-Oneshot-Demo/`를 붙여 접속합니다.

```sh
npm run build
npm run preview
```

## 배포

`main`에 푸시하면 GitHub Actions에서 빌드 후 Pages에 배포합니다. 저장소 Settings → Pages → Source는 **GitHub Actions**를 사용합니다. Vite base는 `/Sanjae-Oneshot-Demo/`입니다.

디자인과 UI 원본: [산재원샷](https://github.com/KimChaeJun/Sanjae-Oneshot)
