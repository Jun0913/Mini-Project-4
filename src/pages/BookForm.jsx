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
      if(!res.ok) throw new Error(`등록 실패: ${res.status}`);

      // App.jsx의 라우트에 의해 
      // Layout 태그 안에서 BookList가 출력
      navigate('/'); 
    } catch(err) {
      console.error(err);
    }
  }
  
  return (
    <>
      <h2>신규 도서 등록</h2>
      <form>
        <input type="text" placeholder='title' 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="text" placeholder='author' 
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input type="text" placeholder='content' 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            handleAddBooks();
          }}
        >
          신규 도서 등록
        </button>
      </form>
    </>
  );
}
