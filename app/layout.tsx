import Header from './_components/Header';
import './globals.css';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Header />
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
