'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    const { data, error } = await signUp(email, password, displayName)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            display_name: displayName,
            plan: 'free',
          },
        ])

      if (profileError) {
        setError('Erreur lors de la création du profil')
        setLoading(false)
        return
      }
    }

    // Redirect to login or dashboard
    router.push('/login?message=signup-success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-yellow-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <Link href="/" className="flex items-center justify-center mb-8">
            <span className="text-3xl font-bold text-primary-600">FlipTrack</span>
          </Link>

          <h1 className="text-2xl font-bold text-warm-900 text-center mb-2">
            Créer un compte
          </h1>
          <p className="text-warm-600 text-center mb-8">
            Rejoins la communauté des flippers
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Nom d'affichage
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tes Flips Vintage"
                className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@example.com"
                className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-warm-900 mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-warm-600 mt-1">
                Minimum 6 caractères
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-warm-700 mt-8">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-warm-700 hover:text-primary-600 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
