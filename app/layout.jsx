import "./globals.css";

export const metadata = {
  title: "EOS Process Documenter — La Vaquita Flea Market",
  description: "EOS 3-Step Process Documentation Agent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
