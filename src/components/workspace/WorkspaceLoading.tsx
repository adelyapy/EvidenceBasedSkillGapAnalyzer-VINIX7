import Image from "next/image";

export default function WorkspaceLoading() {
  return (
    <div
      className="bkwl-screen"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <section className="bkwl-content" aria-label="Status pemuatan workspace">
        <div className="bkwl-brand">
          <Image
            className="bkwl-logo"
            src="/images/logo-icon.svg"
            alt=""
            width={64}
            height={60}
            preload
            style={{ height: "auto" }}
          />
          <span>BUKTIVA</span>
        </div>

        <div className="bkwl-indicator" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="bkwl-copy">
          <h1>Menyiapkan Workspace</h1>
          <p>Sedang menyiapkan ruang kerjamu...</p>
        </div>
      </section>
    </div>
  );
}
