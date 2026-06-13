import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aplauso para el Asador',
  description: 'Organizá el asado con tus amigos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
