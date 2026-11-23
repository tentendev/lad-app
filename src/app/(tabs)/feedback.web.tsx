import { FEEDBACK_CONTACT_NOTE, FEEDBACK_DESCRIPTION, FEEDBACK_THREADS_URL, FEEDBACK_URL } from "@/config/feedback";
import { WebPage } from "@/ui/WebPage.web";

export default function FeedbackScreen() {
  return <WebPage eyebrow="Your feedback" title="回饋" description="一起讓深空省省更好用。">
    <section className="product-card card trust-card"><h2 className="trust-title">你的使用感受，很重要</h2><p>{FEEDBACK_DESCRIPTION}</p><p>{FEEDBACK_CONTACT_NOTE}</p><div className="backup-actions"><a className="backup-button" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">前往使用回饋問卷 ↗</a><a className="backup-button" href={FEEDBACK_THREADS_URL} target="_blank" rel="noopener noreferrer">私訊 Threads ↗</a></div></section>
  </WebPage>;
}
