import { useState } from "react";
import { Linking } from "react-native";
import { Button, Card, Typography } from "heroui-native";
import { FEEDBACK_DESCRIPTION, FEEDBACK_URL } from "@/config/feedback";
import { NativePage } from "@/ui/NativePage";

export default function FeedbackScreen() {
  const [error, setError] = useState<string | null>(null);
  return <NativePage eyebrow="Your feedback" title="回饋" description="一起讓深空省省更好用。">
    <Card className="gap-5 border border-white/40 bg-[#493b70]/80 p-5">
      <Typography.Heading className="text-2xl text-white">你的使用感受，很重要</Typography.Heading>
      <Typography className="text-base leading-7 text-white/80">{FEEDBACK_DESCRIPTION}</Typography>
      <Typography className="text-sm leading-6 text-white/60">問卷將在瀏覽器開啟；填寫前可以查看問卷上的資料使用說明。</Typography>
      <Button onPress={() => { setError(null); void Linking.openURL(FEEDBACK_URL).catch(() => setError("無法開啟問卷，請確認網路連線後再試一次。")); }}>前往使用回饋問卷</Button>
      {error ? <Typography accessibilityRole="alert" className="text-sm text-[#ffc2cb]">{error}</Typography> : null}
    </Card>
  </NativePage>;
}
