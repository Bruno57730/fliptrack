'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { supabase, getProfile, updateProfile, signOut } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
  })

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      setUser(sessionData.session.user)

      const { data: profileData } = await getProfile(sessionData.session.user.id)
      setProfile(profileData)
      setFormData({
        display_name: profileData?.display_name || '',
        email: sessionData.session.user.email || '',
      })
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    const { error } = await updateProfile(user.id, {
      display_name: formData.display_name,
    })

    if (error) {
      alert('Erreur lors de la mise à jour')
      setUpdating(false)
      return
    }

    setProfile((prev) => ({
      ...prev,
      display_name: formData.display_name,
    }))
    setEditing(false)
    setUpdating(false)
  }

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await signOut()
      router.push('/')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-warm-700">Chargement...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-warm-900 mb-8">
          Mon profil
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 md:p-8 space-y-6">
          {!editing ? (
            <>
              {/* View Mode */}
              <div>
                <p className="text-warm-600 text-sm font-semibold mb-2">
                  Nom d'affichage
                </p>
                <p className="text-2xl font-bold text-warm-900">
                  {profile?.display_name || 'Non défini'}
                </p>
              </div>

              <div>
                <p className="text-warm-600 text-sm font-semibold mb-2">
                  Adresse e-mail
                </p>
                <p className="text-lg text-warm-900">{user?.email}</p>
              </div>

              <div>
                <p className="text-warm-600 text-sm font-semibold mb-2">Plan</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-4 py-2 bg-warm-100 text-warm-700 rounded-full font-semibold">
                    {profile?.plan === 'pro' ? 'Pro' : 'Gratuit'}
                  </span>
                  {profile?.plan === 'free' && (
                    <p className="text-warm-600 text-sm">
                      Limite: 20 articles
                    </p>
                  )}
                  {profile?.plan === 'pro' && (
                    <p className="text-warm-600 text-sm">
                      Articles illimités
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-warm-600 text-sm font-semibold mb-2">
                  Compte créé
                </p>
                <p className="text-warm-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </p>
              </div>

              {/* Edit Button */}
              <div className="flex gap-4 pt-4 border-t border-warm-200">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  ✎ Modifier le profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="Ton nom ou pseudo"
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg bg-warm-50 text-warm-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-warm-600 mt-1">
                    L'adresse e-mail ne peut pas être modifiée
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-warm-200">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 px-6 py-3 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-semibold"
                  >
                    {updating ? 'Mise à jour...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Upgrade Section */}
        {profile?.plan === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-yellow-50 rounded-lg shadow p-6 md:p-8 border border-primary-200">
            <h2 className="text-2xl font-bold text-warm-900 mb-3">
              🚀 Passe à Pro
            </h2>
            <p className="text-warm-700 mb-4">
              Débloquer l'accès illimité à tous les articles et fonctionnalités
              avancées.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-warm-600 text-sm mb-1">Gratuit</p>
                <p className="font-semibold text-warm-900">20 articles</p>
              </div>
              <div>
                <p className="text-primary-600 text-sm mb-1">Pro</p>
                <p className="font-semibold text-primary-700">Illimité</p>
              </div>
            </div>
            <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold">
              Devenir Pro - 9,99€/mois
            </button>
          </div>
        )}

        {/* Settings Sections */}
        <div className="mt-8 space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-warm-900 mb-4">
              ⚙️ Paramètres
            </h2>
            <p className="text-warm-700">
              Fonctionnalités additionnelles à venir...
            </p>
          </div>

          {/* Help */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-warm-900 mb-4">❓ Aide</h2>
            <p className="text-warm-700 mb-4">
              Des questions sur FlipTrack ?
            </p>
            <button className="px-4 py-2 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold">
              Contactez le support
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
