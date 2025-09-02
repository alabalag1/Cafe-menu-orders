import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Cafe Menu',
  description: 'QR table ordering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-800">
        <header className="p-4 border-b sticky top-0 bg-white z-10">
          <strong>☕ Cafe</strong>
          <span className="ml-3 text-gray-500">Menu & Orders</span>
        </header>
        <main className="p-4 max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
