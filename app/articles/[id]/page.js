'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase, getItemById, updateItem, uploadPhoto, deletePhoto } from '@/lib/supabase'

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

const STATUSES = [
  { value: 'stock', label: 'En stock' },
  { value: 'restauration', label: 'Restauration' },
  { value: 'liste', label: 'À vendre' },
  { value: 'vendu', label: 'Vendu' },
  { value: 'expedie', label: 'Expédié' },
]

const SALE_PLATFORMS = [
  { value: 'leboncoin', label: 'LeBonCoin', fees: 4.99 },
  { value: 'vinted', label: 'Vinted', fees: 0 },
  { value: 'selency', label: 'Selency', fees: 15 },
  { value: 'facebook', label: 'Facebook', fees: 0 },
  { value: 'brocante', label: 'Brocante', fees: null },
  { value: 'autre', label: 'Autre', fees: null },
]

export default function ArticleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    purchase_price: '',
    purchase_date: '',
    purchase_source: '',
    restoration_cost: '',
    notes: '',
    status: 'stock',
  })

  const [sellData, setSellData] = useState({
    sale_price: '',
    sale_platform: 'leboncoin',
    sale_date: '',
    platform_fees: '',
    shipping_cost: '',
  })

  const [newPhotos, setNewPhotos] = useState([])
  const [newPhotoUrls, setNewPhotoUrls] = useState([])

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.push('/login')
        return
      }

      setUser(sessionData.session.user)

      const { data: itemData, error } = await getItemById(params.id)
      if (error) {
        router.push('/articles')
        return
      }

      setItem(itemData)
      setFormData({
        title: itemData.title || '',
        description: itemData.description || '',
        category: itemData.category || '',
        condition: itemData.condition || '',
        purchase_price: itemData.purchase_price || '',
        purchase_date: itemData.purchase_date || '',
        purchase_source: itemData.purchase_source || '',
        restoration_cost: itemData.restoration_cost || '',
        notes: itemData.notes || '',
        status: itemData.status || 'stock',
      })

      setSellData({
        sale_price: itemData.sale_price || '',
        sale_platform: itemData.sale_platform || 'leboncoin',
        sale_date: itemData.sale_date || '',
        platform_fees: itemData.platform_fees || '',
        shipping_cost: itemData.shipping_cost || '',
      })

      setLoading(false)
    }

    loadData()
  }, [params.id, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSellInputChange = (e) => {
    const { name, value } = e.target
    setSellData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-calculate platform fees
    if (name === 'sale_price' || name === 'sale_platform') {
      const price = parseFloat(name === 'sale_price' ? value : sellData.sale_price)
      const platform = name === 'sale_platform' ? value : sellData.sale_platform
      const platformObj = SALE_PLATFORMS.find((p) => p.value === platform)

      if (platformObj && platformObj.fees !== null && price) {
        const fees = (price * platformObj.fees) / 100
        setSellData((prev) => ({
          ...prev,
          platform_fees: fees.toFixed(2),
        }))
      }
    }
  }

  const handleAddNewPhotos = (e) => {
    const files = Array.from(e.target.files)
    setNewPhotos((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewPhotoUrls((prev) => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
    setNewPhotoUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = async (photoUrl) => {
    const { error } = await deletePhoto(photoUrl)
    if (!error) {
      setItem((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p !== photoUrl),
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const uploadedPhotos = []

      // Upload new photos
      for (const photo of newPhotos) {
        const tempId = Math.random().toString(36).substr(2, 9)
        const { data: photoUrl, error: photoError } = await uploadPhoto(
          user.id,
          photo,
          params.id
        )
        if (!photoError && photoUrl) {
          uploadedPhotos.push(photoUrl)
        }
      }

      // Combine existing and new photos
      const allPhotos = [
        ...(item.photos || []),
        ...uploadedPhotos,
      ]

      // Update item
      const { error } = await updateItem(params.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        purchase_price: parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date,
        purchase_source: formData.purchase_source,
        restoration_cost: formData.restoration_cost
          ? parseFloat(formData.restoration_cost)
          : null,
        notes: formData.notes,
        status: formData.status,
        photos: allPhotos,
      })

      if (error) {
        alert('Erreur lors de la mise à jour: ' + error.message)
        setSubmitting(false)
        return
      }

      setIsEditing(false)
      setNewPhotos([])
      setNewPhotoUrls([])

      // Reload item
      const { data: updatedItem } = await getItemById(params.id)
      setItem(updatedItem)
      setSubmitting(false)
    } catch (err) {
      alert('Une erreur s\'est produite')
      setSubmitting(false)
    }
  }

  const handleSell = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const salePrice = parseFloat(sellData.sale_price)
      const platformFees = parseFloat(sellData.platform_fees || 0)
      const shippingCost = parseFloat(sellData.shipping_cost || 0)
      const totalCost =
        parseFloat(formData.purchase_price) +
        parseFloat(formData.restoration_cost || 0) +
        shippingCost

      const netProfit = salePrice - platformFees - totalCost
      const roiPercent = ((netProfit / totalCost) * 100).toFixed(2)

      const { error } = await updateItem(params.id, {
        status: 'vendu',
        sale_price: salePrice,
        sale_platform: sellData.sale_platform,
        sale_date: sellData.sale_date,
        platform_fees: platformFees,
        shipping_cost: parseFloat(sellData.shipping_cost || 0),
        net_profit: netProfit,
        roi_percent: parseFloat(roiPercent),
      })

      if (error) {
        alert('Erreur lors de la vente: ' + error.message)
        setSubmitting(false)
        return
      }

      setShowSellModal(false)
      const { data: updatedItem } = await getItemById(params.id)
      setItem(updatedItem)
      setFormData((prev) => ({ ...prev, status: 'vendu' }))
      setSubmitting(false)
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

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-warm-700">Article non trouvé</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Link
          href="/articles"
          className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-block"
        >
          ← Retour aux articles
        </Link>

        {!isEditing ? (
          /* View Mode */
          <div className="space-y-6">
            {/* Title and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-warm-900">
                  {item.title}
                </h1>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="bg-warm-100 text-warm-700 px-3 py-1 rounded text-sm">
                    {CATEGORIES.find((c) => c.value === item.category)?.label}
                  </span>
                  <span className="bg-warm-100 text-warm-700 px-3 py-1 rounded text-sm">
                    {item.condition}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  ✎ Modifier
                </button>
                {item.status !== 'vendu' && (
                  <button
                    onClick={() => setShowSellModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    💰 Marquer comme vendu
                  </button>
                )}
              </div>
            </div>

            {/* Photos */}
            {item.photos && item.photos.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-warm-900">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purchase Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-warm-900 mb-4">Achat</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-warm-600">Prix</span>
                    <span className="font-semibold">{item.purchase_price?.toFixed(2)}€</span>
                  </div>
                  {item.purchase_date && (
                    <div className="flex justify-between">
                      <span className="text-warm-600">Date</span>
                      <span className="font-semibold">
                        {new Date(item.purchase_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {item.purchase_source && (
                    <div className="flex justify-between">
                      <span className="text-warm-600">Source</span>
                      <span className="font-semibold">{item.purchase_source}</span>
                    </div>
                  )}
                  {item.restoration_cost && (
                    <div className="flex justify-between border-t border-warm-200 pt-3">
                      <span className="text-warm-600">Restauration</span>
                      <span className="font-semibold text-orange-600">
                        +{item.restoration_cost?.toFixed(2)}€
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-warm-200 pt-3 text-lg">
                    <span className="font-semibold text-warm-900">Total investissement</span>
                    <span className="font-bold text-warm-900">
                      {(
                        parseFloat(item.purchase_price || 0) +
                        parseFloat(item.restoration_cost || 0)
                      ).toFixed(2)}
                      €
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Sale Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-warm-900 mb-4">Statut</h2>
                <div className="space-y-3">
                  <div>
                    <span className="inline-block px-4 py-2 rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          item.status === 'vendu'
                            ? '#dcfce7'
                            : item.status === 'stock'
                            ? '#fef3c7'
                            : '#dbeafe',
                        color:
                          item.status === 'vendu'
                            ? '#166534'
                            : item.status === 'stock'
                            ? '#92400e'
                            : '#1e40af',
                      }}
                    >
                      {STATUSES.find((s) => s.value === item.status)?.label}
                    </span>
                  </div>

                  {item.status === 'vendu' && (
                    <>
                      <div className="border-t border-warm-200 pt-3">
                        <p className="text-warm-600 text-sm mb-3">Prix de vente</p>
                        <p className="text-3xl font-bold text-green-600">
                          +{item.sale_price?.toFixed(2)}€
                        </p>
                      </div>
                      {item.sale_platform && (
                        <div>
                          <span className="text-warm-600 text-sm">Plateforme</span>
                          <p className="font-semibold">{item.sale_platform}</p>
                        </div>
                      )}
                      {item.platform_fees > 0 && (
                        <div>
                          <span className="text-warm-600 text-sm">Frais plateforme</span>
                          <p className="font-semibold text-red-600">
                            -{item.platform_fees?.toFixed(2)}€
                          </p>
                        </div>
                      )}
                      {item.shipping_cost > 0 && (
                        <div>
                          <span className="text-warm-600 text-sm">Frais port</span>
                          <p className="font-semibold text-red-600">
                            -{item.shipping_cost?.toFixed(2)}€
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profit Summary (if sold) */}
            {item.status === 'vendu' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 border-l-4 border-green-500">
                <h2 className="text-lg font-bold text-warm-900 mb-4">Résumé du profit</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix de vente</span>
                    <span className="font-semibold">+{item.sale_price?.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investissement</span>
                    <span className="font-semibold">
                      -{(parseFloat(item.purchase_price || 0) + parseFloat(item.restoration_cost || 0)).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais plateforme</span>
                    <span className="font-semibold">
                      -{item.platform_fees?.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais port</span>
                    <span className="font-semibold">
                      -{item.shipping_cost?.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-green-300 pt-2 text-base font-bold">
                    <span>Profit net</span>
                    <span className="text-green-600">+{item.net_profit?.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>ROI</span>
                    <span className="text-green-600">{item.roi_percent?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description and Notes */}
            {(item.description || item.notes) && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                {item.description && (
                  <div>
                    <h2 className="text-lg font-bold text-warm-900 mb-2">
                      Description
                    </h2>
                    <p className="text-warm-700 whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                )}
                {item.notes && (
                  <div className="border-t border-warm-200 pt-4">
                    <h2 className="text-lg font-bold text-warm-900 mb-2">Notes</h2>
                    <p className="text-warm-700 whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 md:p-8 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-warm-900">Informations de base</h2>

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Catégorie
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
                    État
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

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

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

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Source d'achat
                </label>
                <input
                  type="text"
                  name="purchase_source"
                  value={formData.purchase_source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Coût de restauration (€)
                </label>
                <input
                  type="number"
                  name="restoration_cost"
                  value={formData.restoration_cost}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photos Section */}
            <div className="space-y-4 border-t border-warm-200 pt-6">
              <h2 className="text-xl font-bold text-warm-900">Photos</h2>

              {/* Existing Photos */}
              {item.photos && item.photos.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-warm-700 mb-2">Photos actuelles</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(photo)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Photos */}
              <div className="border-2 border-dashed border-warm-300 rounded-lg p-6 text-center hover:bg-warm-50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddNewPhotos}
                  className="hidden"
                  id="new-photo-input"
                />
                <label htmlFor="new-photo-input" className="cursor-pointer">
                  <p className="text-2xl mb-2">📸</p>
                  <p className="text-warm-700 font-semibold">
                    Ajouter d'autres photos
                  </p>
                </label>
              </div>

              {/* New Photo Previews */}
              {newPhotoUrls.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-warm-700 mb-2">
                    Nouvelles photos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newPhotoUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
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
                rows="3"
                className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 border-t border-warm-200 pt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-3 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-semibold transition-colors"
              >
                {submitting ? 'Mise à jour...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* Sell Modal */}
        {showSellModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <form onSubmit={handleSell} className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-warm-900">
                  Marquer comme vendu
                </h2>

                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Prix de vente (€) *
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={sellData.sale_price}
                    onChange={handleSellInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Sale Platform */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Plateforme de vente *
                  </label>
                  <select
                    name="sale_platform"
                    value={sellData.sale_platform}
                    onChange={handleSellInputChange}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {SALE_PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                        {platform.fees !== null && ` (${platform.fees}%)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sale Date */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Date de vente
                  </label>
                  <input
                    type="date"
                    name="sale_date"
                    value={sellData.sale_date}
                    onChange={handleSellInputChange}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Platform Fees */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Frais plateforme (€)
                  </label>
                  <input
                    type="number"
                    name="platform_fees"
                    value={sellData.platform_fees}
                    onChange={handleSellInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Calculé automatiquement"
                  />
                </div>

                {/* Shipping Cost */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Frais de port (€)
                  </label>
                  <input
                    type="number"
                    name="shipping_cost"
                    value={sellData.shipping_cost}
                    onChange={handleSellInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Profit Preview */}
                {sellData.sale_price && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="font-semibold text-green-900 mb-2">Aperçu du profit</p>
                    <div className="space-y-1 text-sm text-green-800">
                      <div className="flex justify-between">
                        <span>Prix de vente</span>
                        <span>+{parseFloat(sellData.sale_price || 0).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investissement</span>
                        <span>
                          -{(
                            parseFloat(item.purchase_price || 0) +
                            parseFloat(item.restoration_cost || 0)
                          ).toFixed(2)}
                          €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais plateforme</span>
                        <span>-{parseFloat(sellData.platform_fees || 0).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais port</span>
                        <span>-{parseFloat(sellData.shipping_cost || 0).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between border-t border-green-200 pt-1 font-bold">
                        <span>Profit net</span>
                        <span>
                          +
                          {(
                            parseFloat(sellData.sale_price || 0) -
                            (parseFloat(item.purchase_price || 0) +
                              parseFloat(item.restoration_cost || 0)) -
                            parseFloat(sellData.platform_fees || 0) -
                            parseFloat(sellData.shipping_cost || 0)
                          ).toFixed(2)}
                          €
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 border-t border-warm-200 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 px-6 py-3 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                  >
                    {submitting ? 'Enregistrement...' : 'Marquer comme vendu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
