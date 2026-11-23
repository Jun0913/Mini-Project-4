import { NavLink, Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary shadow sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            📖 AI 표지 생성 도서 관리 시스템
          </Link>
          <div className="navbar-nav flex-row gap-3">
            <NavLink className="nav-link" to="/" end>
              📚 도서 목록
            </NavLink>
            <NavLink className="nav-link" to="/books/new">
              📝 도서 등록
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="container py-5 d-flex flex-column flex-grow-1 ">
        <Outlet />
      </main>
    </div>
  );
}
