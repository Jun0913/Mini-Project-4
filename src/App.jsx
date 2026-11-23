import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import BookForm from "./pages/BookForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<BookList />} />
          <Route path="books/new" element={<BookForm />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="books/:id/edit" element={<BookForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}