'use client'

import { useState, useEffect } from 'react'
import { X, Search, User, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userRole: 'admin' | 'cleaner' | 'property_manager'
  onSelectUser: (userId: string) => void
}

interface UserOption {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url: string | null
}

export default function NewChatModal({ 
  isOpen, 
  onClose, 
  userId, 
  userRole,
  onSelectUser 
}: NewChatModalProps) {
  const [users, setUsers] = useState<UserOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch available users based on current user's role
  useEffect(() => {
    if (!isOpen) return

    const fetchUsers = async () => {
      setIsLoading(true)
      
      try {
        let query = supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url')
          .neq('id', userId)
          .eq('is_active', true)

        // Filter based on role:
        // - Admin can message anyone
        // - Cleaner can only message admins
        // - PM can only message admins
        if (userRole === 'cleaner' || userRole === 'property_manager') {
          query = query.eq('role', 'admin')
        }

        const { data, error } = await query.order('full_name')

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [isOpen, userId, userRole, supabase])

  // Filter by search
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true
    const name = user.full_name?.toLowerCase() || ''
    const email = user.email.toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  // Group users by role
  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const role = user.role
    if (!acc[role]) acc[role] = []
    acc[role].push(user)
    return acc
  }, {} as Record<string, UserOption[]>)

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    cleaner: 'Limpiadoras',
    property_manager: 'Property Managers'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Nueva conversación
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                <div key={role}>
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {roleLabels[role] || role}
                    </span>
                  </div>
                  <ul>
                    {roleUsers.map((user) => (
                      <li key={user.id}>
                        <button
                          onClick={() => {
                            onSelectUser(user.id)
                            onClose()
                          }}
                          className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
