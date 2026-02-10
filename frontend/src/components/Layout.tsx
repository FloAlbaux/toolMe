import type { ReactNode } from 'react'
import { Translate } from './Translate'
import { Header } from './Header'
import { Footer } from './Footer'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-toolme-primary)] focus:text-white focus:rounded-md"
      >
        <Translate tid="common.skipToMainContent" />
      </a>

      <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Header />
        <main
          id="main"
          className="mx-auto max-w-4xl px-4 py-12 sm:px-6"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
