import { useState } from 'react';
import { API_URL } from '../api/books';
import { useNavigate } from 'react-router-dom';

export default function BookForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const navigate = useNavigate(); // 주소를 바꿔 주는 함수(hook)
  const handleAddBooks = async () => {
    
    const now = Date.now();

    // 등록 결과는 BookList 컴포넌트에서 확인
    try {
      // 입력 정보 유효성 검사. 빈 문자열, 공백 문자열이면 등록 거부
      if(!title.trim() || !author.trim() || !content.trim())
        throw new Error(`등록할 도서의 정보를 모두 입력해주세요`);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: title,
          author: author,
          content: content,
          coverImageUrl: "",
          createdAt: now,
          updatedAt: now
        })
      });

      // 서버 측 거부/에러 발생시 로그에 에러 메시지 출력
      if(!res.ok) throw new Error(res.status);

      alert("✅ 도서 등록이 완료되었습니다.");
      // App.jsx의 라우트에 의해 
      // Layout 태그 안에서 BookList가 출력
      navigate('/'); 
    } catch(err) {
      alert(`⚠️ 도서 등록에 실패했습니다.\n${err.message}`);
    }
  }
  
  return (
    <div className="col-md-8 col-lg-6 mx-auto">
      <h1 className="h3 mb-4">신규 도서 등록</h1>
      <p className="mb-4">등록하실 도서의 정보를 입력해주세요</p>
      <hr />
      <form>
        <div className="mb-3">
          <label htmlFor="book-title" className="form-label">제목</label>
          <input
            id="book-title"
            type="text"
            className="form-control"
            placeholder="도서 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="book-author" className="form-label">저자</label>
          <input
            id="book-author"
            type="text"
            className="form-control"
            placeholder="저자를 입력하세요"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="book-content" className="form-label">내용</label>
          <textarea
            id="book-content"
            className="form-control"
            rows={8}
            placeholder="도서 소개를 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            취소
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAddBooks()}
          >
            신규 도서 등록
          </button>
        </div>
      </form>
    </div>
  );
}
