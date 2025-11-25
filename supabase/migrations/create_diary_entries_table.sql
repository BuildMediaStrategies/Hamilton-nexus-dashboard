-- Create diary_entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own entries
CREATE POLICY "Users can view their own diary entries"
  ON diary_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own entries
CREATE POLICY "Users can create their own diary entries"
  ON diary_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only update their own entries
CREATE POLICY "Users can update their own diary entries"
  ON diary_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can only delete their own entries
CREATE POLICY "Users can delete their own diary entries"
  ON diary_entries
  FOR DELETE
  USING (auth.uid() = user_id);
