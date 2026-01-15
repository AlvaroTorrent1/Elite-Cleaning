'use client'

import { useState } from 'react'
import { MessageCircle, Search, User, Users } from 'lucide-react'
import { useConversations, ConversationWithParticipant } from '@/lib/hooks/use-conversations'
import { formatDistanceToNow } from '@/lib/utils/date-utils'

interface ChatListProps {
  userId: string
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onStartNewChat?: () => void
}

// Role badge colors
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return { label: 'Admin', className: 'bg-purple-100 text-purple-700' }
    case 'cleaner':
      return { label: 'Limpiadora', className: 'bg-blue-100 text-blue-700' }
    case 'property_manager':
      return { label: 'PM', className: 'bg-green-100 text-green-700' }
    default:
      return { label: role, className: 'bg-gray-100 text-gray-700' }
  }
}

export default function ChatList({ 
  userId, 
  selectedConversationId, 
  onSelectConversation,
  onStartNewChat 
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { conversations, totalUnreadCount, isLoading, error } = useConversations({ userId })

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true
    const name = c.other_participant?.full_name?.toLowerCase() || ''
    const email = c.other_participant?.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || email.includes(query)
  })

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensajes
            {totalUnreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </h2>
          {onStartNewChat && (
            <button
              onClick={onStartNewChat}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Nuevo mensaje"
            >
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500 text-sm">{error}</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
            </p>
            {onStartNewChat && !searchQuery && (
              <button
                onClick={onStartNewChat}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Iniciar una conversación
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Individual conversation item
interface ConversationItemProps {
  conversation: ConversationWithParticipant
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { other_participant, last_message_text, last_message_at, unread_count } = conversation
  const roleBadge = other_participant ? getRoleBadge(other_participant.role) : null

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3 ${
          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''
        } ${unread_count > 0 ? 'bg-blue-50/50' : ''}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {other_participant?.avatar_url ? (
            <img
              src={other_participant.avatar_url}
              alt={other_participant.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium truncate ${unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
              {other_participant?.full_name || 'Usuario desconocido'}
            </span>
            {last_message_at && (
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatDistanceToNow(last_message_at)}
              </span>
            )}
          </div>

          {/* Role badge */}
          {roleBadge && (
            <span className={`inline-block px-1.5 py-0.5 text-xs rounded mt-0.5 ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
          )}

          {/* Last message preview */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className={`text-sm truncate ${unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {last_message_text || 'Sin mensajes'}
            </p>
            {unread_count > 0 && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold bg-primary-500 text-white rounded-full">
                {unread_count}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}
