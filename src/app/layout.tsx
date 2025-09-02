export const metadata = {
  title: 'Cafe Menu',
  description: 'QR table ordering MVP'
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <strong>☕ Cafe</strong>
          <span style={{ marginLeft: 12, color: '#666' }}>Menu & Orders</span>
        </header>
        <main style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>{children}</main>
      </body>
    </html>
  );
}
