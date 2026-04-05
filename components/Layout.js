'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, signOut } from '@/lib/supabase'

export default function Layout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          router.push('/')
        } else {
          setUser(session?.user)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Accueil', icon: '🏠' },
    { href: '/articles', label: 'Articles', icon: '📦' },
    { href: '/articles/nouveau', label: 'Ajouter', icon: '➕' },
    { href: '/depenses', label: 'Dépenses', icon: '💰' },
    { href: '/profil', label: 'Profil', icon: '👤' },
  ]

  const isActive = (href) => pathname === href

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:bg-white md:border-r md:border-warm-200 md:flex md:flex-col md:p-6">
        <Link href="/dashboard" className="mb-8 text-2xl font-bold text-primary-600">
          FlipTrack
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-warm-700 hover:bg-warm-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
        >
          Déconnexion
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-warm-200 z-40 flex items-center justify-between p-4">
        <span className="text-xl font-bold text-primary-600">FlipTrack</span>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-2xl"
        >
          ☰
        </button>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-200 flex justify-around items-center h-20 z-40">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors flex-1 ${
              isActive(item.href)
                ? 'text-primary-600'
                : 'text-warm-700'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-14 right-0 bg-white border border-warm-200 rounded-lg shadow-lg p-4 m-4 z-50">
          <button
            onClick={() => {
              setShowMobileMenu(false)
              handleLogout()
            }}
            className="w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 rounded"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
