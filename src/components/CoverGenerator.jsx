import { useEffect, useRef, useState } from "react";
import { API_URL } from "../api/books";

const OPENAI_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_EDIT_URL = "https://api.openai.com/v1/images/edits";

const MODEL_OPTIONS = [
  { value: "gpt-image-2:1024x1536", model: "gpt-image-2", size: "1024x1536", label: "GPT Image 2 (1024x1536)" },
  { value: "gpt-image-2:1024x1024", model: "gpt-image-2", size: "1024x1024", label: "GPT Image 2 (1024x1024)" },
];
const QUALITY_OPTIONS = ["low", "medium", "high"];

export default function CoverGenerator({ book, onGenerated }) {
  const [apiKey, setApiKey] = useState("");
  const [modelValue, setModelValue] = useState(MODEL_OPTIONS[0].value);
  const [quality, setQuality] = useState("low");
  const [revision, setRevision] = useState("");
  const [useCurrentCover, setUseCurrentCover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const compareDialog = useRef(null);

  useEffect(() => {
    if (previewUrl && !compareDialog.current.open) {
      compareDialog.current.showModal();
    }
  }, [previewUrl]);

  const buildPrompt = (referenceImage) => {
    const content = (book.content || "").slice(0, 500);
    const prompt = `다음 책에 어울리는 도서 표지 일러스트를 만들어주세요.
제목: ${book.title}
저자: ${book.author || "미상"}
내용: ${content}
책 표지 디자인, 세로형 구도, 제목이 돋보이는 분위기.`;
    const coverPrompt = referenceImage
      ? `${prompt}
제공된 현재 표지의 구도와 주요 요소를 참고해 새 시안을 만들어주세요. 요청한 변경 사항 외에는 기존 요소를 가능한 한 유지해주세요.`
      : prompt;
    const requestedRevision = revision.trim();

    if (!book.coverImageUrl || !requestedRevision) return coverPrompt;

    return `${coverPrompt}
책의 제목, 저자, 내용과 어울리도록 새 표지에 다음 요청 사항을 반영해주세요.
요청 사항: ${requestedRevision}`;
  };

  async function saveCover(dataUrl) {
    const response = await fetch(`${API_URL}/${encodeURIComponent(book.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl: dataUrl }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`표지 저장 실패 (${response.status}) ${text.slice(0, 200)}`);
    }

    onGenerated?.(dataUrl);
  }

  function closeComparison() {
    compareDialog.current.close();
    setPreviewUrl("");
    setSaveError("");
  }

  async function applyPreview() {
    if (saving || !previewUrl) return;

    setSaving(true);
    setSaveError("");
    try {
      await saveCover(previewUrl);
      closeComparison();
    } catch (err) {
      setSaveError(err instanceof TypeError ? "표지 저장 중 네트워크 오류가 발생했습니다." : err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleGenerateCover = async () => {
    if (loading || saving || previewUrl) return;
    if (!apiKey.trim()) {
      setError("OpenAI API Key를 입력해주세요.");
      return;
    }
    const selected = MODEL_OPTIONS.find((o) => o.value === modelValue);
    const referenceImage = useCurrentCover ? book.coverImageUrl : "";
    const requestBody = {
      model: selected.model,
      prompt: buildPrompt(referenceImage),
      n: 1,
      size: selected.size,
      quality,
      output_format: "png",
    };
    if (referenceImage) {
      requestBody.images = [{ image_url: referenceImage }];
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(referenceImage ? OPENAI_EDIT_URL : OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("API Key가 올바르지 않습니다. 키를 확인해주세요.");
        if (res.status === 429) throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        const errBody = await res.json().catch(() => null);
        throw new Error(`이미지 생성 실패 (${res.status}) ${errBody?.error?.message || ""}`);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("응답을 해석할 수 없습니다.");
      }

      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) throw new Error("응답에 이미지 데이터가 없습니다.");
      const dataUrl = `data:image/png;base64,${b64}`;

      if (book.coverImageUrl) {
        setPreviewUrl(dataUrl);
      } else {
        await saveCover(dataUrl);
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError("네트워크 오류가 발생했습니다. 연결을 확인해주세요.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card shadow-sm border-0 my-4">
      <div className="card-body">
        <h2 className="h5 card-title mb-3">AI 표지 생성</h2>

        <div className="mb-3">
          <label htmlFor="cg-key" className="form-label">OpenAI API Key</label>
          <input
            id="cg-key"
            type="password"
            className="form-control"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-sm-8">
            <label htmlFor="cg-model" className="form-label">생성 모델</label>
            <select
              id="cg-model"
              className="form-select"
              value={modelValue}
              onChange={(e) => setModelValue(e.target.value)}
            >
              {MODEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-4">
            <label htmlFor="cg-quality" className="form-label">품질</label>
            <select
              id="cg-quality"
              className="form-select"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              {QUALITY_OPTIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        {book.coverImageUrl && (
          <div className="mb-3">
            <div className="form-check mb-2">
              <input
                id="cg-reference-cover"
                type="checkbox"
                className="form-check-input"
                checked={useCurrentCover}
                onChange={(e) => setUseCurrentCover(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="cg-reference-cover" className="form-check-label">현재 표지 참고</label>
            </div>
            <label htmlFor="cg-revision" className="form-label">요청 사항 (선택)</label>
            <input
              id="cg-revision"
              type="text"
              className="form-control"
              placeholder={useCurrentCover
                ? "예: 구도는 유지하고 제목만 더 크게 해주세요"
                : "예: 짙은 남색 배경에 제목을 크게 배치해 주세요"}
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <p className="form-text">※ 표지를 생성할 때마다 OpenAI API 사용 비용이 발생합니다.</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerateCover}
          disabled={loading || saving || Boolean(previewUrl) || !apiKey.trim()}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              생성 중...
            </>
          ) : (
            book.coverImageUrl ? "✨ 재생성하기" : "✨ 생성하기"
          )}
        </button>

        {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
      </div>

      <dialog
        ref={compareDialog}
        className="rounded-3 border-0 bg-body text-body shadow p-3 p-sm-4"
        style={{ width: "min(640px, calc(100% - 32px))" }}
        aria-labelledby="cover-compare-title"
        onCancel={(event) => {
          event.preventDefault();
          if (!saving) closeComparison();
        }}
      >
        {previewUrl && (
          <>
            <h2 id="cover-compare-title" className="h5 mb-3">표지 비교</h2>
            <div className="d-grid align-items-center gap-2 gap-sm-3 text-center"
              style={{ gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)" }}
            >
              <figure className="m-0">
                <figcaption className="fw-semibold mb-2">현재 표지</figcaption>
                <img
                  className="w-100 object-fit-contain rounded bg-body-tertiary"
                  style={{ aspectRatio: "2 / 3", maxHeight: "45dvh" }}
                  src={book.coverImageUrl}
                  alt="현재 도서 표지"
                />
              </figure>
              <span aria-hidden="true" className="text-muted">→</span>
              <figure className="m-0">
                <figcaption className="fw-semibold mb-2">새 표지</figcaption>
                <img
                  className="w-100 object-fit-contain rounded bg-body-tertiary"
                  style={{ aspectRatio: "2 / 3", maxHeight: "45dvh" }}
                  src={previewUrl}
                  alt="새로 생성한 도서 표지"
                />
              </figure>
            </div>
            <p className="my-3">새 표지를 적용하시겠어요?</p>
            {saveError && <p className="alert alert-danger" role="alert">{saveError}</p>}
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={closeComparison}>
                기존 표지 유지
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={applyPreview}>
                {saving ? "저장 중…" : "새 표지 적용"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
