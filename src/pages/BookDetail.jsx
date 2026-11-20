import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../api/books";

export default function BookDetail() {
  const { id } = useParams(); // id 읽기
  const deleteDialog = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteDone, setDeleteDone] = useState(false);

  useEffect(() => {
    const cancelHandle = new AbortController();

    async function loadBook() {
      // 새 요청 시작 시 로딩을 켜고 이전 에러를 지워 줌
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          signal: cancelHandle.signal,
        });

        if (response.status === 404) {
          throw new Error("해당 도서를 찾을 수 없습니다.");
        }
        if (!response.ok) {
          throw new Error("도서 정보를 불러오지 못했습니다.");
        }

        setBook(await response.json());
      } catch (err) {
        if (!cancelHandle.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!cancelHandle.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBook();

    // 화면을 떠나거나 id가 바뀌면 이전 요청을 취소
    return () => cancelHandle.abort();
  }, [id]);

  function formatDate(value) {
    return new Date(value).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
    });
  }

  function openDeleteDialog() {
    setDeleteDone(false);
    setDeleteError("");
    deleteDialog.current.showModal();
  }

  // 팝업에서 '예'를 눌렀을 때만 삭제 요청을 보냄
  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("도서를 삭제하지 못했습니다.");
      }

      // 같은 팝업을 삭제 완료 화면으로 바꿈
      setDeleteDone(true);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit() {}

  return (
    <div>
      <section>
        {loading && <p>도서 정보를 불러오는 중이에요...⌛</p>}

        {!loading && error && <p role="alert">{error}</p>}

        {!loading && !error && book && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
              <h1 style={{ margin: 0 }}>{book.title}</h1>
              <h3 style={{ margin: 0, marginRight: "auto" }}>{book.author}</h3>

              <button
                type="button"
                onClick={openDeleteDialog}
                aria-label="도서 삭제"
              >
                🗑️
              </button>

              <button type="button" onClick={handleEdit}>
                수정
              </button>
            </div>

            <p>등록일자: {formatDate(book.createdAt)}</p>

            {book.updatedAt && book.createdAt !== book.updatedAt && (
              <p>수정일자: {formatDate(book.updatedAt)}</p>
            )}

            {book.coverImageUrl && (
              <img
                src={book.coverImageUrl}
                alt={`${book.title} 표지`}
                width={180}
              />
            )}

            <h3>줄거리</h3>
            <p>{book.content || "등록된 도서 소개가 없어요."}</p>

            <dialog
              ref={deleteDialog}
              aria-labelledby="delete-title"
              style={{
                width: "220px",
                maxWidth: "calc(100vw - 32px)",
                boxSizing: "border-box",
                padding: "16px",
                margin: "auto",
                borderRadius: "12px",
                textAlign: "center",
              }}
              onCancel={(event) => {
                if (deleting) event.preventDefault();
              }}
              onClose={() => {
                // 삭제 완료 상태에서 팝업을 닫으면 목록으로 이동
                if (deleteDone) window.location.replace("/");
              }}
            >
              <p id="delete-title" style={{ margin: "0 0 12px" }}>
                {deleteDone
                  ? "도서 삭제 완료 🗑️"
                  : `‘${book.title}’ 도서를 삭제할까요?`}
              </p>

              {deleteError && <p role="alert">{deleteError}</p>}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                {deleteDone ? (
                  <button
                    type="button"
                    onClick={() => deleteDialog.current.close()}
                  >
                    확인
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "삭제 중…" : "예"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteDialog.current.close()}
                      disabled={deleting}
                    >
                      아니오
                    </button>
                  </>
                )}
              </div>
            </dialog>
          </>
        )}
      </section>
    </div>
  );
}
