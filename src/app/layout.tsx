import './globals.css'

export const metadata = {
  title: 'Cafe Menu',
  description: 'QR table ordering MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <header className="app-header">
          <strong>☕ Cafe</strong>
          <span className="app-header-sub">Menu & Orders</span>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
