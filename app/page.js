'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-yellow-50 to-warm-100">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-600">FlipTrack</div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-warm-700 hover:text-primary-600 font-medium"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/profil"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Profil
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-warm-700 hover:text-primary-600 font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-900 mb-6 leading-tight">
          Chaque flip compte.
          <br />
          <span className="text-primary-600">Suis ton vrai profit.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-warm-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          L'app de gestion pour les brocanteurs et flippers qui veulent savoir
          exactement combien ils gagnent — article par article.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!isLoggedIn && (
            <>
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Créer mon compte gratuit
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-warm-100 text-lg border-2 border-primary-600"
              >
                Déjà un compte ?
              </Link>
            </>
          )}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 text-lg shadow-lg"
            >
              Aller au tableau de bord
            </Link>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-warm-900 mb-12">
            Pourquoi FlipTrack ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-warm-50 rounded-xl p-8 border border-warm-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-warm-900 mb-3">
                Suivi détaillé
              </h3>
              <p className="text-warm-700">
                Enregistre chaque article, ses coûts et ses ventes pour avoir une
                visibilité complète sur tes profits réels.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-warm-50 rounded-xl p-8 border border-warm-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-warm-900 mb-3">
                Gestion simple
              </h3>
              <p className="text-warm-700">
                Interface intuitive spécialement conçue pour les flippers.
                Ajoute des photos, des détails et gère tes stocks facilement.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-warm-50 rounded-xl p-8 border border-warm-200 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-warm-900 mb-3">
                Calculs automatiques
              </h3>
              <p className="text-warm-700">
                Les frais de plateforme, marges et ROI sont calculés
                automatiquement pour chaque vente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-warm-900 mb-12">
            Tarification simple et transparente
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl p-8 border-2 border-warm-300 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-warm-900 mb-2">Gratuit</h3>
              <p className="text-warm-700 mb-6">Parfait pour débuter</p>
              <div className="text-3xl font-bold text-primary-600 mb-6">
                0€<span className="text-lg text-warm-700">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  20 articles
                </li>
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Suivi des ventes
                </li>
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Gestion des dépenses
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="text-gray-400 mr-3">✗</span>
                  Photos illimitées
                </li>
              </ul>
              {!isLoggedIn && (
                <Link
                  href="/signup"
                  className="block w-full px-6 py-3 bg-warm-200 text-warm-900 rounded-lg font-semibold hover:bg-warm-300 text-center"
                >
                  Commencer
                </Link>
              )}
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-primary-50 to-yellow-50 rounded-xl p-8 border-2 border-primary-400 shadow-xl">
              <div className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                Populaire
              </div>
              <h3 className="text-2xl font-bold text-warm-900 mb-2">Pro</h3>
              <p className="text-warm-700 mb-6">Pour les flippers sérieux</p>
              <div className="text-3xl font-bold text-primary-600 mb-6">
                9,99€<span className="text-lg text-warm-700">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Articles illimités
                </li>
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Suivi des ventes complet
                </li>
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Gestion des dépenses avancée
                </li>
                <li className="flex items-center text-warm-700">
                  <span className="text-primary-600 mr-3">✓</span>
                  Photos illimitées
                </li>
              </ul>
              {!isLoggedIn && (
                <Link
                  href="/signup"
                  className="block w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 text-center"
                >
                  Démarrer Pro
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">
            © 2024 FlipTrack. Conçu pour les brocanteurs et flippers français.
          </p>
          <p className="text-warm-400">
            Suivi de profit simple. Gestion intelligente. Résultats clairs.
          </p>
        </div>
      </footer>
    </div>
  )
}
