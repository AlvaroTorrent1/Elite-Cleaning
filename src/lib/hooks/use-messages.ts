'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

interface UseMessagesOptions {
  conversationId: string | null
  userId: string
}

interface UseMessagesReturn {
  messages: MessageWithSender[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<boolean>
  markAsRead: () => Promise<void>
  refetch: () => Promise<void>
}

export function useMessages({ conversationId, userId }: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasMarkedRead = useRef(false)
  
  const supabase = createClient()

  // Fetch messages for conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      
      // Get messages
      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgsError) throw msgsError

      if (!msgs || msgs.length === 0) {
        setMessages([])
        setError(null)
        return
      }

      // Get unique sender IDs
      const senderIds = [...new Set(msgs.map(m => m.sender_id))]

      // Fetch sender profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', senderIds)

      if (profilesError) throw profilesError

      // Combine data
      const messagesWithSender: MessageWithSender[] = msgs.map(msg => ({
        ...msg,
        sender: profiles?.find(p => p.id === msg.sender_id) || null
      }))

      setMessages(messagesWithSender)
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Error al cargar mensajes')
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, supabase])

  // Send a new message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!conversationId || !content.trim()) return false

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: content.trim()
        } as any)

      if (insertError) throw insertError

      // Message will appear via realtime subscription
      return true
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }, [conversationId, userId, supabase])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || hasMarkedRead.current) return

    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() } as any)
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (updateError) throw updateError
      
      hasMarkedRead.current = true

      // Update local state
      setMessages(prev => prev.map(m => 
        m.sender_id !== userId && !m.read_at 
          ? { ...m, read_at: new Date().toISOString() } 
          : m
      ))
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [conversationId, userId, supabase])

  // Initial fetch
  useEffect(() => {
    hasMarkedRead.current = false
    fetchMessages()
  }, [fetchMessages])

  // Mark as read when conversation opens
  useEffect(() => {
    if (messages.length > 0 && !hasMarkedRead.current) {
      markAsRead()
    }
  }, [messages, markAsRead])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: sender || null
          }

          setMessages(prev => [...prev, messageWithSender])

          // Mark as read if not from current user
          if (newMessage.sender_id !== userId) {
            hasMarkedRead.current = false
            markAsRead()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          setMessages(prev => 
            prev.map(m => m.id === updatedMessage.id 
              ? { ...m, ...updatedMessage } 
              : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, userId, supabase, markAsRead])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  }
}
