import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api/books.js";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setBooks(data);
      } catch {
        if (!controller.signal.aborted) {
          setError("도서 목록을 불러오지 못했습니다. json-server가 실행 중인지 확인해 주세요.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBooks();

    return () => controller.abort();
  }, []);

  // 제목 또는 저자에 검색어가 포함된 도서만 표시 (대소문자 무시)
  const filteredBooks = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (book) =>
        (book.title || "").toLowerCase().includes(q) ||
        (book.author || "").toLowerCase().includes(q)
    );
  }, [books, keyword]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">도서 목록을 불러오는 중입니다.</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">📚 도서 목록</h1>
        <Link to="/books/new" className="btn btn-primary">
          📝 도서 등록
        </Link>
      </div>

      <div className="card card-outline shadow-sm mb-4">
        <div className="card-body">
          {/* 검색창 */}
          <div className="mb-2">
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="제목 또는 저자로 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="도서 검색"
              />
              {keyword && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setKeyword("")}
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          <p className="small text-muted mb-0">
            {keyword.trim()
              ? `검색 결과 ${filteredBooks.length}권 / 전체 ${books.length}권`
              : `전체 ${books.length}권`}
          </p>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="text-muted">등록된 도서가 없습니다.</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-muted">‘{keyword}’에 해당하는 도서가 없습니다.</p>
      ) : (
        <div className="row g-3">
          {filteredBooks.map((book) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={book.id}>
              <div className="card card-outline h-100 shadow-sm">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={`${book.title} 표지`}
                    className="card-img-top"
                    style={{ aspectRatio: "2 / 3", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-light d-flex align-items-center justify-content-center text-muted small"
                    style={{ aspectRatio: "2 / 3" }}
                  >
                    표지 없음
                  </div>
                )}
                <div className="card-body p-2">
                  <h2 className="h6 card-title mb-1">
                    <Link
                      to={`/books/${book.id}`}
                      className="text-decoration-none stretched-link"
                    >
                      {book.title}
                    </Link>
                  </h2>
                  <p className="card-text small mb-0">{book.author}</p>
                </div>
                {book.createdAt && (
                  <div className="card-footer small text-muted py-1">
                    {new Date(book.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
