# 4차 미니프로젝트 · 도서관리 시스템

도서를 등록하고 관리하는 웹 앱입니다. 도서 상세 화면에서 제목, 저자, 내용을 바탕으로 AI 표지를 생성하고 도서 정보와 함께 저장할 수 있습니다.

**팀원** 장보경, 박성호, 윤찬혁, 이가영, 이준형

## 주요 기능

- 도서 목록에서 표지, 제목, 저자, 등록일을 확인하고 카드에서 상세 화면으로 이동합니다.
- 제목, 저자, 내용을 입력해 도서를 등록합니다. 수정 화면에서는 기존 정보를 불러오고, 변경한 항목만 저장합니다.
- 상세 화면에서 삭제를 확인한 뒤 도서를 삭제합니다.
- OpenAI API로 생성한 표지를 저장하고 상세 화면에 바로 표시합니다.

## 기술 스택

React 19 · Vite 8 · React Router · Bootstrap 5 · json-server 0.17.4 · OpenAI Images API

## 로컬 실행

Node.js 20.x는 20.19.0 이상, 이후 버전은 22.12.0 이상이 필요합니다. 아래 명령은 `package.json`과 `db.json`이 있는 프로젝트 폴더에서 실행합니다.

1. 첫 번째 터미널에서 의존성을 설치하고 React 개발 서버를 실행합니다.

   ```bash
   npm ci
   npm run dev
   ```

2. 새 터미널을 열고 같은 폴더에서 도서 API를 실행합니다.

   ```bash
   npx json-server@0.17.4 --watch db.json --port 3000
   ```

3. 두 터미널을 켜 둔 상태에서 Vite가 표시한 `Local` 주소로 접속합니다. 기본 주소는 [http://localhost:5173](http://localhost:5173)입니다. [http://localhost:3000/books](http://localhost:3000/books)에서는 도서 목록 JSON을 확인할 수 있습니다.

## 화면 경로

| 화면 | 경로 |
| --- | --- |
| 도서 목록 | `/` |
| 도서 상세 | `/books/:id` |
| 도서 등록 | `/books/new` |
| 도서 수정 | `/books/:id/edit` |

## 도서 API

기본 주소는 `http://localhost:3000`입니다. `:id`에는 도서의 식별자를 넣습니다. `POST`와 `PATCH` 요청 본문은 `application/json` 형식으로 전송합니다.

| 메서드 | 경로 | 동작 | 요청 본문 |
| --- | --- | --- | --- |
| `GET` | `/books` | 도서 목록 조회 | — |
| `GET` | `/books/:id` | 도서 상세 조회 | — |
| `POST` | `/books` | 새 도서 등록 | `title`, `author`, `content`, `coverImageUrl`, `createdAt`, `updatedAt` |
| `PATCH` | `/books/:id` | 도서 정보 수정 | 변경된 `title`, `author`, `content` 중 해당 항목과 `updatedAt` |
| `PATCH` | `/books/:id` | AI 표지 저장 | `coverImageUrl` |
| `DELETE` | `/books/:id` | 도서 삭제 | — |

등록 시 `id`는 json-server가 부여합니다. 처음 등록할 때는 `coverImageUrl`을 빈 문자열로 두고, `createdAt`과 `updatedAt`에는 같은 시각을 저장합니다. 도서 정보를 수정하면 `updatedAt`이 갱신됩니다. 데이터는 프로젝트의 `db.json`에 저장됩니다.

## AI 표지 생성

1. 도서 상세 화면에서 **AI 표지 생성** 버튼을 눌러 설정을 엽니다.
2. OpenAI API 키를 입력하고 이미지 크기와 품질을 선택합니다. 앱에서 설정한 모델은 `gpt-image-2`입니다.
3. **AI 표지 생성**을 누르면 앱이 OpenAI Images API에 요청합니다. 생성된 이미지는 `coverImageUrl`에 저장되고 상세 화면에 바로 표시됩니다.

도서 CRUD는 API 키 없이 이용할 수 있습니다. 표지 생성 요청에는 OpenAI API 사용 비용이 발생할 수 있습니다. 키는 상세 화면의 비밀번호 입력란에 넣고 저장소에 커밋하지 마세요.
