const steps = [
  {
    title: "도서 등록하기",
    description:
      "상단의 도서 등록 메뉴에서 제목과 줄거리를 입력하고 저장하세요.",
  },
  {
    title: "등록한 책 찾아보기",
    description:
      "도서 목록에서 책을 고르면 표지와 줄거리를 볼 수 있어요. 상세 화면에서 책 정보를 수정하거나 삭제할 수 있어요.",
  },
  {
    title: "표지 만들기",
    description:
      "책의 상세 화면에서 표지 생성 버튼을 눌러 줄거리에 어울리는 표지를 만들 수 있어요.",
  },
];

export default function Home() {
  return (
    <div className="py-4 py-md-5">
      <section
        aria-labelledby="home-title"
        className="card card-outline shadow-sm p-4 p-md-5"
      >
        <h1
          id="home-title"
          className="display-6 fw-bold mb-3"
          style={{ color: "#31ADAA" }}
        >
          AI 표지 생성 도서 관리 시스템
        </h1>

        <p
          className="text-muted lh-lg mb-0"
          style={{ maxWidth: "40rem", wordBreak: "keep-all" }}
        >
          책 제목과 줄거리를 기록해 나만의 서재를 만들어 보세요.<br />
          등록한 책은 언제든 다시 찾아볼 수 있고, 줄거리에 어울리는 표지도 AI로 만들 수 있어요.
        </p>
      </section>

      <section aria-labelledby="guide-title" className="mt-4 mt-md-5">
        <h2 id="guide-title" className="h5 fw-bold mb-3">
          이용 방법
        </h2>

        <ol className="row g-3 list-unstyled mb-0">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="col-12 col-md-4">
              <div className="h-100 card card-outline shadow-sm p-3 p-lg-4">
                <h3 className="h6 fw-bold mb-2" style={{ color: "#31ADAA" }}>
                  {index + 1}. {title}
                </h3>

                <p
                  className="text-muted lh-lg mb-0"
                  style={{ wordBreak: "keep-all" }}
                >
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}