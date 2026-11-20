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

  if (loading) return <p>도서 목록을 불러오는 중입니다.</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <section>
      <h1>도서 목록</h1>

      {books.length === 0 ? (
        <p>등록된 도서가 없습니다.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={`${book.title} 표지`}
                  width={80}
                />
              )}
              <h2>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </h2>
              <p>저자 {book.author}</p>
              {book.createdAt && (
                <p>
                  등록일 {new Date(book.createdAt).toLocaleDateString("ko-KR")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
