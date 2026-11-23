import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
        <h2>AI 표지 생성을 지원하는 도서관리시스템</h2>
        <nav>
          <Link to="/">도서 목록</Link> | <Link to="/books/new">도서 등록</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}