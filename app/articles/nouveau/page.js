'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase, createItem, uploadPhoto } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'meuble', label: 'Meuble' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'luminaire', label: 'Luminaire' },
  { value: 'vaisselle', label: 'Vaisselle' },
  { value: 'textile', label: 'Textile' },
  { value: 'autre', label: 'Autre' },
]

const CONDITIONS = [
  { value: 'a_restaurer', label: 'À restaurer' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'comme_neuf', label: 'Comme neuf' },
]

export default function NewArticlePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'meuble',
    condition: 'bon_etat',
    purchase_price: '',
    purchase_date: '',
    purchase_source: '',
    restoration_cost: '',
    notes: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.push('/login')
        return
      }
      setUser(sessionData.session.user)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files)
    setPhotos((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload photos
      const uploadedPhotos = []
      for (const photo of photos) {
        const tempId = Math.random().toString(36).substr(2, 9)
        const { data: photoUrl, error: photoError } = await uploadPhoto(
          user.id,
          photo,
          tempId
        )
        if (!photoError && photoUrl) {
          uploadedPhotos.push(photoUrl)
        }
      }

      // Create item
      const { data, error } = await createItem({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        status: 'stock',
        purchase_price: parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date,
        purchase_source: formData.purchase_source,
        restoration_cost: formData.restoration_cost
          ? parseFloat(formData.restoration_cost)
          : null,
        photos: uploadedPhotos,
        notes: formData.notes,
      })

      if (error) {
        alert('Erreur lors de la création de l\'article: ' + error.message)
        setSubmitting(false)
        return
      }

      // Redirect to articles list
      router.push('/articles')
    } catch (err) {
      alert('Une erreur s\'est produite')
      setSubmitting(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/articles"
            className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux articles
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-warm-900">
            Ajouter un nouvel article
          </h1>
          <p className="text-warm-700 mt-2">
            Complète les informations de ton nouvel achat
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 md:p-8 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-warm-900">Informations de base</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Lampe vintage en laiton"
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décris l'article en détail..."
                rows="4"
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  État *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Info Section */}
          <div className="space-y-4 border-t border-warm-200 pt-6">
            <h2 className="text-xl font-bold text-warm-900">Achat</h2>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Prix d'achat (€) *
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Date d'achat
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Purchase Source */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Source d'achat
              </label>
              <input
                type="text"
                name="purchase_source"
                value={formData.purchase_source}
                onChange={handleInputChange}
                placeholder="Ex: Brocante, Leboncoin, Vide-grenier..."
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Restoration Cost */}
            <div>
              <label className="block text-sm font-semibold text-warm-900 mb-2">
                Coût de restauration (€)
              </label>
              <input
                type="number"
                name="restoration_cost"
                value={formData.restoration_cost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Photos Section */}
          <div className="space-y-4 border-t border-warm-200 pt-6">
            <h2 className="text-xl font-bold text-warm-900">Photos</h2>

            {/* File Input */}
            <div className="border-2 border-dashed border-warm-300 rounded-lg p-6 text-center hover:bg-warm-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="cursor-pointer">
                <p className="text-2xl mb-2">📸</p>
                <p className="text-warm-700 font-semibold">
                  Clique pour ajouter des photos
                </p>
                <p className="text-warm-600 text-sm">
                  ou glisse-dépose les fichiers
                </p>
              </label>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-4 border-t border-warm-200 pt-6">
            <h2 className="text-xl font-bold text-warm-900">Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notes supplémentaires ou informations importantes..."
              rows="3"
              className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 border-t border-warm-200 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-semibold transition-colors"
            >
              {submitting ? 'Création en cours...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
