import type { JSX } from "react";
import { Card, Typography } from "@/ui/NativeComponents";
import { NativePage } from "@/ui/NativePage";
import { NativeLink } from "@/ui/NativeLink";

export default function NotFoundScreen(): JSX.Element {
  return <NativePage eyebrow="404" title="這裡沒有排期" description="連結可能已經失效，或網址多了一個字。" showAccountEntry={false}>
    <Card className="gap-4 border border-line bg-glass p-5">
      <Typography className="type-label text-muted">404</Typography>
      <Typography className="type-body text-ink">連結可能已經失效，或網址多了一個字。</Typography>
      <NativeLink href="/schedule" className="type-body text-ink underline">返回排期</NativeLink>
    </Card>
  </NativePage>;
}
