import './globals.scss'

export const metadata = {
  title: 'Dungeons & Diagrams Solver',
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <header>Hi</header>
        {children}
      </body>
    </html>
  )
}
