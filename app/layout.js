import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FlipTrack - Gestion de vos flips',
  description: 'Suivi de profit pour brocanteurs et flippers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-warm-50`}>
        {children}
      </body>
    </html>
  )
}
