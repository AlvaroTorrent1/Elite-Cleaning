'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatList, ChatWindow, NewChatModal } from '@/components/shared/chat'
import { useConversations } from '@/lib/hooks/use-conversations'

export default function PMMensajesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [isMobileListView, setIsMobileListView] = useState(true)

  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [supabase])

  const { conversations, startConversation } = useConversations({ 
    userId: userId || '' 
  })

  // Get selected conversation's other participant
  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setIsMobileListView(false)
  }

  const handleStartNewChat = async (recipientId: string) => {
    const conversationId = await startConversation(recipientId)
    if (conversationId) {
      setSelectedConversationId(conversationId)
      setIsMobileListView(false)
    }
  }

  const handleBack = () => {
    setIsMobileListView(true)
    setSelectedConversationId(null)
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-gray-100 rounded-xl overflow-hidden shadow-sm">
      {/* Chat List - Hidden on mobile when conversation is selected */}
      <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 ${
        !isMobileListView ? 'hidden lg:block' : ''
      }`}>
        <ChatList
          userId={userId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onStartNewChat={() => setShowNewChatModal(true)}
        />
      </div>

      {/* Chat Window - Hidden on mobile when showing list */}
      <div className={`flex-1 ${isMobileListView ? 'hidden lg:flex' : 'flex'}`}>
        <ChatWindow
          conversationId={selectedConversationId}
          userId={userId}
          otherParticipant={selectedConversation?.other_participant}
          onBack={handleBack}
        />
      </div>

      {/* New Chat Modal - PM can only message admins */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        userId={userId}
        userRole="property_manager"
        onSelectUser={handleStartNewChat}
      />
    </div>
  )
}
