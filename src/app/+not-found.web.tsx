import type { JSX } from "react";

import { WebPage } from "@/ui/WebPage.web";

export default function NotFoundScreen(): JSX.Element {
  return (
    <div className="web-app standalone-page">
      <main className="web-main">
        <WebPage
          eyebrow="404"
          title="頁面不存在"
          description="這個連結可能已經失效，請返回排期頁繼續使用深空省省。"
          showAboutLink={false}
        >
          <section className="product-card card trust-card not-found-card">
            <p className="card-kicker">404</p>
            <h2 className="trust-title">這裡沒有排期</h2>
            <p>連結可能已經失效，或網址多了一個字。</p>
            <a className="back-link" href="/schedule">返回排期</a>
          </section>
        </WebPage>
      </main>
    </div>
  );
}
