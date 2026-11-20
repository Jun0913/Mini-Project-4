import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header>
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