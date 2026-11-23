import { useState } from "react";
import { API_URL } from "../api/books";
import "./CoverGenerator.css";

const OPENAI_URL = "https://api.openai.com/v1/images/generations";

const MODEL_OPTIONS = [
  { value: "gpt-image-2:1024x1536", model: "gpt-image-2", size: "1024x1536", label: "GPT Image 2 (1024x1536)" },
  { value: "gpt-image-2:1024x1024", model: "gpt-image-2", size: "1024x1024", label: "GPT Image 2 (1024x1024)" },
];
const QUALITY_OPTIONS = ["low", "medium", "high"];

export default function CoverGenerator({ book, onGenerated }) {
  const [apiKey, setApiKey] = useState("");
  const [modelValue, setModelValue] = useState(MODEL_OPTIONS[0].value);
  const [quality, setQuality] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildPrompt = () => {
    const content = (book.content || "").slice(0, 500);
    return `다음 책에 어울리는 도서 표지 일러스트를 만들어주세요.
제목: ${book.title}
저자: ${book.author || "미상"}
내용: ${content}
책 표지 디자인, 세로형 구도, 제목이 돋보이는 분위기.`;
  };

  const handleGenerateCover = async () => {
    if (!apiKey.trim()) {
      setError("OpenAI API Key를 입력해주세요.");
      return;
    }
    const selected = MODEL_OPTIONS.find((o) => o.value === modelValue);

    setLoading(true);
    setError("");

    try {
      const res = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: selected.model,
          prompt: buildPrompt(),
          n: 1,
          size: selected.size,
          quality,
          output_format: "png",
        }),
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

      const patchRes = await fetch(`${API_URL}/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: dataUrl }),
      });
      if (!patchRes.ok) {
        const text = await patchRes.text().catch(() => "");
        throw new Error(`표지 저장 실패 (${patchRes.status}) ${text.slice(0, 200)}`);
      }

      onGenerated?.(dataUrl);
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
    <section className="cg">
      <h3 className="cg-title">AI 표지 생성</h3>

      <div className="cg-field">
        <label htmlFor="cg-key">OpenAI API Key:</label>
        <input
          id="cg-key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="cg-field">
        <label htmlFor="cg-model">생성 모델:</label>
        <select id="cg-model" value={modelValue} onChange={(e) => setModelValue(e.target.value)}>
          {MODEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="cg-field">
        <label htmlFor="cg-quality">품질:</label>
        <select id="cg-quality" value={quality} onChange={(e) => setQuality(e.target.value)}>
          {QUALITY_OPTIONS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <p className="cg-notice">※ 표지를 생성할 때마다 OpenAI API 사용 비용이 발생합니다.</p>

      <button
        type="button"
        className="cg-button"
        onClick={handleGenerateCover}
        disabled={loading || !apiKey.trim()}
      >
        {loading ? "생성 중..." : "AI 표지 생성"}
      </button>

      {error && <p className="cg-error" role="alert">{error}</p>}
    </section>
  );
}
