import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { DevMark } from "@/components/dev-mark";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Rising Star Talent Club",
    template: "%s · Rising Star Talent Club",
  },
  description:
    "Family-friendly contests for babies, kids, teens, and young talents. Free entries, verified certificates, and a certified jury.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`}>
      <body
        className={`${plusJakarta.className} min-h-full overflow-x-clip bg-surface font-body-md text-body-md text-on-surface antialiased`}
      >
        {children}
        {process.env.NODE_ENV === "development" ? <DevMark /> : null}
      </body>
    </html>
  );
}
