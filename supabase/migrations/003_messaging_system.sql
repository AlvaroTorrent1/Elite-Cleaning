-- =====================================================
-- MESSAGING SYSTEM
-- Version: 1.0
-- Date: 2026-01-15
-- =====================================================
-- Sistema de mensajería interna entre usuarios
-- Soporta: Admin <-> Limpiadora, Admin <-> PM
-- =====================================================

-- =====================================================
-- CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Participants (always 2 users)
  participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Last message info for preview
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_by UUID REFERENCES profiles(id),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint to ensure unique conversation between two users
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
  -- Ensure participant_1_id < participant_2_id to avoid duplicates
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id)
);

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- Read status
  read_at TIMESTAMPTZ,
  -- Optional: link to cleaning or report
  related_cleaning_id UUID REFERENCES cleanings(id),
  related_damage_report_id UUID REFERENCES damage_reports(id),
  related_lost_item_id UUID REFERENCES lost_item_reports(id),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- CONVERSATION PARTICIPANTS VIEW
-- Helper view to get conversations for a user
-- =====================================================
CREATE OR REPLACE VIEW user_conversations AS
SELECT 
  c.id,
  c.participant_1_id,
  c.participant_2_id,
  c.last_message_text,
  c.last_message_at,
  c.last_message_by,
  c.created_at,
  -- Determine the "other" participant for queries
  CASE 
    WHEN c.participant_1_id = auth.uid() THEN c.participant_2_id
    ELSE c.participant_1_id
  END as other_participant_id
FROM conversations c
WHERE c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid();

-- =====================================================
-- FUNCTION: Get or Create Conversation
-- =====================================================
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_1 UUID, user_2 UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
BEGIN
  -- Ensure consistent ordering (smaller UUID first)
  IF user_1 < user_2 THEN
    v_participant_1 := user_1;
    v_participant_2 := user_2;
  ELSE
    v_participant_1 := user_2;
    v_participant_2 := user_1;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE participant_1_id = v_participant_1 AND participant_2_id = v_participant_2;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1_id, participant_2_id)
    VALUES (v_participant_1, v_participant_2)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Send Message
-- =====================================================
CREATE OR REPLACE FUNCTION send_message(
  p_recipient_id UUID,
  p_content TEXT,
  p_related_cleaning_id UUID DEFAULT NULL,
  p_related_damage_report_id UUID DEFAULT NULL,
  p_related_lost_item_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_message_id UUID;
  v_sender_id UUID;
BEGIN
  v_sender_id := auth.uid();
  
  -- Get or create conversation
  v_conversation_id := get_or_create_conversation(v_sender_id, p_recipient_id);
  
  -- Insert message
  INSERT INTO messages (
    conversation_id, 
    sender_id, 
    content,
    related_cleaning_id,
    related_damage_report_id,
    related_lost_item_id
  )
  VALUES (
    v_conversation_id, 
    v_sender_id, 
    p_content,
    p_related_cleaning_id,
    p_related_damage_report_id,
    p_related_lost_item_id
  )
  RETURNING id INTO v_message_id;
  
  -- Update conversation with last message
  UPDATE conversations
  SET 
    last_message_text = p_content,
    last_message_at = NOW(),
    last_message_by = v_sender_id,
    updated_at = NOW()
  WHERE id = v_conversation_id;
  
  -- Create notification for recipient
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    p_recipient_id,
    'new_message',
    'Nuevo mensaje de ' || full_name,
    LEFT(p_content, 100),
    jsonb_build_object(
      'conversation_id', v_conversation_id,
      'message_id', v_message_id,
      'sender_id', v_sender_id
    )
  FROM profiles WHERE id = v_sender_id;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Mark Messages as Read
-- =====================================================
CREATE OR REPLACE FUNCTION mark_messages_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get Unread Count
-- =====================================================
CREATE OR REPLACE FUNCTION get_unread_messages_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    AND m.sender_id != auth.uid()
    AND m.read_at IS NULL;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: users can only see their own conversations
CREATE POLICY "Users view own conversations" ON conversations
  FOR SELECT USING (
    participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  );

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    participant_1_id = auth.uid() OR participant_2_id = auth.uid()
  );

-- Messages: users can only see messages in their conversations
CREATE POLICY "Users view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- =====================================================
-- TRIGGER: Update conversation on new message
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = NEW.content,
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();
