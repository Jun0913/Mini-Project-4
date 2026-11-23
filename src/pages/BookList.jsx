import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api/books.js";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">도서 목록</h1>
        <Link to="/books/new" className="btn btn-primary">
          도서 등록
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-muted">등록된 도서가 없습니다.</p>
      ) : (
        <div className="row g-4">
          {books.map((book) => (
            <div className="col-6 col-md-4 col-lg-3" key={book.id}>
              <div className="card h-100 shadow-sm">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={`${book.title} 표지`}
                    className="card-img-top"
                    style={{ aspectRatio: "2 / 3", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-light d-flex align-items-center justify-content-center text-muted"
                    style={{ aspectRatio: "2 / 3" }}
                  >
                    표지 없음
                  </div>
                )}
                <div className="card-body">
                  <h2 className="h6 card-title">
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
                  <div className="card-footer small text-muted">
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
