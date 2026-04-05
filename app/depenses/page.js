'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { supabase, getExpenses, getItems, createExpense, updateExpense, deleteExpense } from '@/lib/supabase'

const EXPENSE_CATEGORIES = [
  { value: 'carburant', label: 'Carburant' },
  { value: 'materiaux', label: 'Matériaux' },
  { value: 'emplacement', label: 'Emplacement' },
  { value: 'emballage', label: 'Emballage' },
  { value: 'expedition', label: 'Expédition' },
  { value: 'autre', label: 'Autre' },
]

export default function ExpensesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    amount: '',
    category: 'autre',
    description: '',
    date: '',
    item_id: '',
  })

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      setUser(sessionData.session.user)

      const { data: expensesData } = await getExpenses(sessionData.session.user.id)
      const { data: itemsData } = await getItems(sessionData.session.user.id)

      setExpenses(expensesData || [])
      setItems(itemsData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  const resetForm = () => {
    setFormData({
      amount: '',
      category: 'autre',
      description: '',
      date: '',
      item_id: '',
    })
    setEditingId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const expenseData = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      item_id: formData.item_id || null,
    }

    try {
      if (editingId) {
        const { error } = await updateExpense(editingId, expenseData)
        if (error) {
          alert('Erreur lors de la mise à jour')
          return
        }
      } else {
        const { error } = await createExpense(expenseData)
        if (error) {
          alert('Erreur lors de la création')
          return
        }
      }

      // Reload expenses
      const { data: expensesData } = await getExpenses(user.id)
      setExpenses(expensesData || [])
      resetForm()
      setShowForm(false)
    } catch (err) {
      alert('Une erreur s\'est produite')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      const { error } = await deleteExpense(id)
      if (!error) {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id))
      }
    }
  }

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      item_id: expense.item_id || '',
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, exp) => sum + (exp.amount || 0), 0)

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

  const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat.label,
    value: cat.value,
    total: expenses
      .filter((exp) => exp.category === cat.value)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0),
  }))

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
              Mes dépenses
            </h1>
            <p className="text-warm-700 mt-2">
              Suivi de tes dépenses et investissements
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-center"
          >
            {showForm ? '✕ Fermer' : '➕ Ajouter une dépense'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* This Month */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">
              Ce mois-ci
            </p>
            <p className="text-3xl font-bold text-warm-900">
              {monthlyExpenses.toFixed(2)}€
            </p>
            <p className="text-warm-600 text-xs mt-2">
              {expenses.filter((exp) => {
                const expDate = new Date(exp.date)
                return (
                  expDate.getMonth() === currentMonth &&
                  expDate.getFullYear() === currentYear
                )
              }).length}{' '}
              dépense(s)
            </p>
          </div>

          {/* Total */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">Total</p>
            <p className="text-3xl font-bold text-warm-900">
              {totalExpenses.toFixed(2)}€
            </p>
            <p className="text-warm-600 text-xs mt-2">
              {expenses.length} dépense(s) au total
            </p>
          </div>

          {/* Average */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <p className="text-warm-600 text-sm font-semibold mb-2">Moyenne</p>
            <p className="text-3xl font-bold text-warm-900">
              {(totalExpenses / (expenses.length || 1)).toFixed(2)}€
            </p>
            <p className="text-warm-600 text-xs mt-2">Par dépense</p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
            <h2 className="text-xl font-bold text-warm-900">
              {editingId ? 'Modifier la dépense' : 'Ajouter une dépense'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Montant (€) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Item Link */}
                <div>
                  <label className="block text-sm font-semibold text-warm-900 mb-2">
                    Lié à un article (optionnel)
                  </label>
                  <select
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Aucun article</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-warm-900 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Détails de la dépense..."
                  className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  className="flex-1 px-6 py-2 bg-warm-200 text-warm-900 rounded-lg hover:bg-warm-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                >
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenses by Category */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Par catégorie
              </h2>
              <div className="space-y-3">
                {expensesByCategory
                  .filter((cat) => cat.total > 0)
                  .map((cat) => (
                    <div key={cat.value}>
                      <div className="flex justify-between mb-1">
                        <span className="text-warm-700 font-medium">
                          {cat.category}
                        </span>
                        <span className="font-semibold text-warm-900">
                          {cat.total.toFixed(2)}€
                        </span>
                      </div>
                      <div className="w-full bg-warm-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (cat.total / totalExpenses) * 100 || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Latest Expenses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-warm-900 mb-4">
                Dépenses récentes
              </h2>
              <div className="space-y-2">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-2 hover:bg-warm-50 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-warm-900">
                        {EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
                          ?.label || expense.category}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-warm-600">
                          {expense.description}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-warm-900">
                      -{expense.amount?.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-3xl mb-4">💸</p>
            <p className="text-warm-700 text-lg">Aucune dépense enregistrée</p>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
            >
              Ajouter une première dépense
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-warm-200">
              <h2 className="text-xl font-bold text-warm-900">
                Toutes les dépenses
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-warm-50 border-b border-warm-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-warm-900">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-warm-900">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-warm-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {expenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-warm-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-warm-900">
                          {new Date(expense.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-warm-100 text-warm-700 px-3 py-1 rounded text-sm font-medium">
                            {EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
                              ?.label || expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-warm-700">
                          {expense.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-warm-900">
                          -{expense.amount?.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
