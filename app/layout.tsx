import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "./globals.css";
import "../styles.css";
import { env } from "@/lib/env";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "마블 룰렛",
  description: "공으로 즐기는 핀볼 사다리",
  metadataBase: env.NEXT_PUBLIC_SITE_URL ? new URL(env.NEXT_PUBLIC_SITE_URL) : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
