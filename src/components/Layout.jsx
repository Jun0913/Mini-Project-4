import { NavLink, Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-light bg-body-tertiary shadow-sm sticky-top">
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
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  );
}
