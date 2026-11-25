import { ImageResponse } from "next/og";
import { getContent } from "@/content/load";
import { defaultLocale, hasLocale } from "@/i18n/config";

export const alt = "Alberto Sanmartín Martínez";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { profile } = getContent(hasLocale(lang) ? lang : defaultLocale);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#0f172a",
        color: "#f8fafc",
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 700 }}>{profile.name}</div>
      <div style={{ fontSize: 36, marginTop: 24, color: "#94a3b8" }}>{profile.headline}</div>
    </div>,
    size,
  );
}
