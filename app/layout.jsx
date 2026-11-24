import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "./globals.css";
export const metadata = {
  title: "Halvian | Patient Navigator",
  description:
    "Interactive patient communication and follow-up for a fictional emergency department visit.",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
