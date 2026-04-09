import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Auth functions
export const signUp = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  return { data, error }
}

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  return { data, error }
}

// Items functions
export const getItems = async (userId) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const getItemById = async (id) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export const createItem = async (item) => {
  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
  return { data, error }
}

export const updateItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteItem = async (id) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
  return { error }
}

// Expenses functions
export const getExpenses = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return { data, error }
}

export const createExpense = async (expense) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
  return { data, error }
}

export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  return { error }
}

// Profile functions
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  return { data, error }
}

// Storage functions
export const uploadPhoto = async (userId, file, itemId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${itemId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('item-photos')
    .upload(fileName, file)

  if (error) return { data: null, error }

  const { data: publicData } = supabase.storage
    .from('item-photos')
    .getPublicUrl(fileName)

  return { data: publicData.publicUrl, error: null }
}

export const deletePhoto = async (photoUrl) => {
  // Extract path from public URL
  const urlParts = photoUrl.split('/storage/v1/object/public/item-photos/')
  if (!urlParts[1]) return { error: 'Invalid photo URL' }

  const { error } = await supabase.storage
    .from('item-photos')
    .remove([urlParts[1]])

  return { error }
}
