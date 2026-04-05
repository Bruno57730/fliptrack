'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase, getItems, getExpenses } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      setUser(sessionData.session.user)

      const { data: itemsData } = await getItems(sessionData.session.user.id)
      const { data: expensesData } = await getExpenses(
        sessionData.session.user.id
      )

      setItems(itemsData || [])
      setExpenses(expensesData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyItems = items.filter((item) => {
    const saleDate = item.sale_date ? new Date(item.sale_date) : null
    return (
      saleDate &&
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    )
  })

  const monthlyRevenue = monthlyItems.reduce(
    (sum, item) => sum + (item.sale_price || 0),
    0
  )

  const monthlyExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, exp) => sum + (exp.amount || 0), 0)

  const monthlyProfit = monthlyRevenue - monthlyExpenses

  const stockItems = items.filter((item) => item.status === 'stock').length
  const soldItems = items.filter((item) => item.status === 'vendu').length

  const bestFlip = monthlyItems.length > 0
    ? monthlyItems.reduce((best, item) => {
        return (item.net_profit || 0) > (best.net_profit || 0) ? item : best
      }, monthlyItems[0])
    : null

  // Alert for old stock
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const oldStockItems = items.filter(
    (item) =>
      item.status === 'stock' &&
      new Date(item.created_at) < thirtyDaysAgo
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-warm-700">Chargement...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-warm-900">
            Tableau de bord
          </h1>
          <p className="text-warm-700 mt-2">
            Suivi de tes flips ce mois-ci
          </p>
        </div>

        {/* Alert for old stock */}
        {oldStockItems.length > 0 && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 font-semibold">
              ⚠️ {oldStockItems.length} article(s) en stock depuis plus de 30 jours
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Considère les réduire ou les retirer du stock.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* CA du mois */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">
              Chiffre d'affaires
            </p>
            <p className="text-3xl font-bold text-warm-900">
              {monthlyRevenue.toFixed(2)}€
            </p>
            <p className="text-warm-600 text-xs mt-2">
              {monthlyItems.length} article(s) vendu(s)
            </p>
          </div>

          {/* Profit net */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">
              Profit net
            </p>
            <p className={`text-3xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyProfit.toFixed(2)}€
            </p>
            <p className="text-warm-600 text-xs mt-2">
              Après dépenses
            </p>
          </div>

          {/* Articles en stock */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">
              En stock
            </p>
            <p className="text-3xl font-bold text-warm-900">{stockItems}</p>
            <p className="text-warm-600 text-xs mt-2">
              En attente de vente
            </p>
          </div>

          {/* Articles vendus */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">
              Vendus
            </p>
            <p className="text-3xl font-bold text-warm-900">{soldItems}</p>
            <p className="text-warm-600 text-xs mt-2">
              Total de ventes
            </p>
          </div>
        </div>

        {/* Best Flip */}
        {bestFlip && (
          <div className="bg-gradient-to-r from-primary-50 to-yellow-50 rounded-lg shadow p-6 mb-8 border-l-4 border-primary-500">
            <h2 className="text-xl font-bold text-warm-900 mb-4">
              🏆 Meilleur flip du mois
            </h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-warm-900">
                  {bestFlip.title}
                </p>
                <p className="text-warm-700 text-sm mt-1">
                  {bestFlip.category} • {bestFlip.condition}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  +{bestFlip.net_profit?.toFixed(2)}€
                </p>
                <p className="text-warm-700 text-sm">
                  ROI: {bestFlip.roi_percent?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/articles/nouveau"
            className="bg-primary-600 text-white rounded-lg p-6 hover:bg-primary-700 transition-colors flex items-center justify-between"
          >
            <span className="text-xl font-semibold">Ajouter un article</span>
            <span className="text-3xl">➕</span>
          </Link>
          <Link
            href="/articles"
            className="bg-warm-200 text-warm-900 rounded-lg p-6 hover:bg-warm-300 transition-colors flex items-center justify-between"
          >
            <span className="text-xl font-semibold">Voir mes articles</span>
            <span className="text-3xl">📦</span>
          </Link>
        </div>

        {/* Recent Items */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-warm-200">
              <h2 className="text-xl font-bold text-warm-900">Articles récents</h2>
            </div>
            <div className="divide-y divide-warm-200">
              {items.slice(0, 5).map((item) => (
                <Link
                  key={item.id}
                  href={`/articles/${item.id}`}
                  className="p-4 hover:bg-warm-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-warm-900">{item.title}</p>
                    <p className="text-warm-600 text-sm">
                      {item.category} • {item.condition}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        item.status === 'vendu'
                          ? 'text-green-600'
                          : 'text-warm-700'
                      }`}
                    >
                      {item.status === 'vendu'
                        ? `+${item.net_profit?.toFixed(2)}€`
                        : item.purchase_price?.toFixed(2) + '€'}
                    </p>
                    <p className="text-warm-600 text-xs">
                      {item.status === 'stock'
                        ? 'En stock'
                        : item.status === 'vendu'
                        ? 'Vendu'
                        : 'En restauration'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
