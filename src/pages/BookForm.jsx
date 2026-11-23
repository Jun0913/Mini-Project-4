import { useEffect, useState } from 'react';
import { API_URL } from '../api/books';
import { useNavigate, useParams } from 'react-router-dom';

const emptyForm = { title: "", author: "", content: "" };

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const bookUrl = isEdit ? `${API_URL}/${encodeURIComponent(id)}` : null;
  const action = isEdit ? "수정" : "등록";
  const navigate = useNavigate();

  const [previousId, setPreviousId] = useState(id);
  const [form, setForm] = useState(emptyForm);
  const [originalBook, setOriginalBook] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  if (id !== previousId) {
    setPreviousId(id);
    setForm(emptyForm);
    setOriginalBook(null);
    setLoadError("");
  }

  useEffect(() => {
    if (!bookUrl) return;

    const controller = new AbortController();

    async function loadBook() {
      try {
        const res = await fetch(bookUrl, { signal: controller.signal });
        if (res.status === 404) throw new Error("해당 도서를 찾을 수 없습니다.");
        if (!res.ok) throw new Error(`도서 정보를 불러오지 못했습니다. (HTTP ${res.status})`);

        const book = await res.json();
        const fields = {
          title: book.title ?? "",
          author: book.author ?? "",
          content: book.content ?? "",
        };
        if (!controller.signal.aborted) {
          setForm(fields);
          setOriginalBook(fields);
        }
      } catch (err) {
        if (!controller.signal.aborted) setLoadError(err.message);
      }
    }

    loadBook();
    return () => controller.abort();
  }, [bookUrl]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function addBook(title, author, content, now) {
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

    return res;
  }

  const handleSaveBook = async (event) => {
    event.preventDefault();
    if (saving || (isEdit && !originalBook)) return;

    const { title, author, content } = form;
    if (!title.trim() || !author.trim() || !content.trim()) {
      alert("⚠️ 제목, 저자, 내용을 모두 입력해 주세요.");
      return;
    }

    const changes = {};
    if (isEdit) {
      if (title !== originalBook.title) changes.title = title;
      if (author !== originalBook.author) changes.author = author;
      if (content !== originalBook.content) changes.content = content;

      if (Object.keys(changes).length === 0) {
        alert("변경된 항목이 없습니다.");
        return;
      }
    }

    const now = new Date().toISOString();
    setSaving(true);
    try {
      const res = isEdit
        ? await fetch(bookUrl, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ ...changes, updatedAt: now })
          })
        : await addBook(title, author, content, now);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      alert(`✅ 도서 ${action}이 완료되었습니다.`);
      navigate('/');
    } catch (err) {
      alert(`⚠️ 도서 ${action}에 실패했습니다.\n${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <p className="alert alert-danger" role="alert">{loadError}</p>;
  if (isEdit && !originalBook) return <p className="text-body-secondary" role="status">도서 정보를 불러오는 중입니다.</p>;

  return (
    <div className="col-md-8 col-lg-6 mx-auto">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h1 className="h3 mb-4">{isEdit ? "도서 수정" : "신규 도서 등록"}</h1>
          <p className="mb-4">{isEdit ? "수정할 도서 정보를 입력하세요" : "시스템에 등록하실 도서의 정보를 입력하세요"}</p>
          <hr />
          <form onSubmit={handleSaveBook}>
            <div className="mb-3">
              <label htmlFor="book-title" className="form-label">제목</label>
              <input
                id="book-title"
                name="title"
                type="text"
                className="form-control"
                placeholder="도서 제목을 입력하세요"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="book-author" className="form-label">저자</label>
              <input
                id="book-author"
                name="author"
                type="text"
                className="form-control"
                placeholder="저자를 입력하세요"
                value={form.author}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="book-content" className="form-label">내용</label>
              <textarea
                id="book-content"
                name="content"
                className="form-control"
                rows={8}
                placeholder="도서 소개를 입력하세요"
                value={form.content}
                onChange={handleChange}
              />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
              >
                ❌ 취소
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {isEdit ? "✏️ 수정" : "📝 등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
