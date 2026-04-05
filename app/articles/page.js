'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase, getItems } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'meuble', label: 'Meuble' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'luminaire', label: 'Luminaire' },
  { value: 'vaisselle', label: 'Vaisselle' },
  { value: 'textile', label: 'Textile' },
  { value: 'autre', label: 'Autre' },
]

const STATUSES = [
  { value: 'stock', label: 'En stock', color: 'yellow' },
  { value: 'restauration', label: 'Restauration', color: 'blue' },
  { value: 'liste', label: 'À vendre', color: 'orange' },
  { value: 'vendu', label: 'Vendu', color: 'green' },
  { value: 'expedie', label: 'Expédié', color: 'purple' },
]

export default function ArticlesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      setUser(sessionData.session.user)
      const { data: itemsData } = await getItems(sessionData.session.user.id)
      setItems(itemsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  // Filter items
  useEffect(() => {
    let filtered = items

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus) {
      filtered = filtered.filter((item) => item.status === selectedStatus)
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, selectedStatus, selectedCategory])

  const getStatusColor = (status) => {
    const statusObj = STATUSES.find((s) => s.value === status)
    if (!statusObj) return 'gray'
    return statusObj.color
  }

  const getStatusLabel = (status) => {
    const statusObj = STATUSES.find((s) => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-warm-900">
              Mes articles
            </h1>
            <p className="text-warm-700 mt-2">
              {filteredItems.length} article(s) trouvé(s)
            </p>
          </div>
          <Link
            href="/articles/nouveau"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-center"
          >
            ➕ Ajouter un article
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8 space-y-4 md:space-y-0 md:flex md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les statuts</option>
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedStatus || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('')
                setSelectedCategory('')
              }}
              className="px-4 py-2 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-medium"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-3xl mb-4">📭</p>
            <p className="text-warm-700 text-lg">Aucun article trouvé</p>
            <p className="text-warm-600 mt-2">
              {items.length === 0
                ? 'Commence par ajouter un article'
                : 'Ajuste tes filtres de recherche'}
            </p>
            {items.length === 0 && (
              <Link
                href="/articles/nouveau"
                className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
              >
                Ajouter un article
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/articles/${item.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* Image */}
                {item.photos && item.photos.length > 0 ? (
                  <div className="h-48 bg-warm-200 overflow-hidden relative">
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center">
                    <span className="text-5xl">📦</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-bold text-warm-900 line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  {/* Category and Condition */}
                  <div className="flex gap-2 mb-3 text-xs">
                    <span className="bg-warm-100 text-warm-700 px-2 py-1 rounded">
                      {CATEGORIES.find((c) => c.value === item.category)?.label}
                    </span>
                    <span className="bg-warm-100 text-warm-700 px-2 py-1 rounded">
                      {item.condition}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        colorClasses[getStatusColor(item.status)]
                      }`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  {/* Price Info */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-warm-600">Achat:</span>
                      <span className="font-semibold text-warm-900">
                        {item.purchase_price?.toFixed(2)}€
                      </span>
                    </div>

                    {item.status === 'vendu' && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-warm-600">Vente:</span>
                          <span className="font-semibold text-warm-900">
                            {item.sale_price?.toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-warm-200 mt-2">
                          <span className="text-warm-600">Profit net:</span>
                          <span className="font-bold text-green-600">
                            +{item.net_profit?.toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-warm-600">ROI:</span>
                          <span className="font-bold text-green-600">
                            {item.roi_percent?.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
