import Header from './_components/Header';
import { Providers } from './_components/providers';
import './globals.css';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body className={`antialiased`}>
          <Header />
          {children}
        </body>
      </Providers>
    </html>
  );
}
