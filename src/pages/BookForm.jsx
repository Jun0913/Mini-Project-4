import { useState } from 'react';


export default function BookForm() {
  // CoverGenerator 컴포넌트를 출력하더라도 
  // 입력 폼의 값을 유지할 수 있게 state로 정의
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  return (
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
      >
        AI 표지 생성?
      </button>
    </form>
  );
}
