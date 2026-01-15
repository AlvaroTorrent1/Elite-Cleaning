'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Conversation = Database['public']['Tables']['conversations']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface ConversationWithParticipant extends Conversation {
  other_participant: Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'avatar_url'> | null
  unread_count: number
}

interface UseConversationsOptions {
  userId: string
}

interface UseConversationsReturn {
  conversations: ConversationWithParticipant[]
  totalUnreadCount: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  startConversation: (recipientId: string) => Promise<string | null>
}

export function useConversations({ userId }: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch conversations with participant info and unread count
  const fetchConversations = useCallback(async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      
      // Get all conversations for this user
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (convosError) throw convosError

      if (!convos || convos.length === 0) {
        setConversations([])
        setError(null)
        return
      }

      // Get other participant IDs
      const otherParticipantIds = convos.map(c => 
        c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id
      )

      // Fetch profiles for other participants
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .in('id', otherParticipantIds)

      if (profilesError) throw profilesError

      // Get unread counts for each conversation
      const { data: unreadCounts, error: unreadError } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', convos.map(c => c.id))
        .neq('sender_id', userId)
        .is('read_at', null)

      if (unreadError) throw unreadError

      // Count unreads per conversation
      const unreadMap = (unreadCounts || []).reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Combine data
      const conversationsWithData: ConversationWithParticipant[] = convos.map(convo => {
        const otherParticipantId = convo.participant_1_id === userId 
          ? convo.participant_2_id 
          : convo.participant_1_id
        
        return {
          ...convo,
          other_participant: profiles?.find(p => p.id === otherParticipantId) || null,
          unread_count: unreadMap[convo.id] || 0
        }
      })

      setConversations(conversationsWithData)
      setError(null)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('Error al cargar conversaciones')
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Start a new conversation (or get existing one)
  const startConversation = useCallback(async (recipientId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user_1: userId,
        user_2: recipientId
      })

      if (error) throw error
      
      // Refetch to update list
      await fetchConversations()
      
      return data as string
    } catch (err) {
      console.error('Error starting conversation:', err)
      return null
    }
  }, [userId, supabase, fetchConversations])

  // Initial fetch
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Realtime subscription for conversation updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Refetch on any conversation change
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refetch when new messages arrive (to update unread counts)
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, fetchConversations])

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return {
    conversations,
    totalUnreadCount,
    isLoading,
    error,
    refetch: fetchConversations,
    startConversation
  }
}
