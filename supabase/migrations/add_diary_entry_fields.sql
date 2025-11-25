-- Add new fields to diary_entries table
ALTER TABLE diary_entries
ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'note',
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add check constraint for entry_type
ALTER TABLE diary_entries
ADD CONSTRAINT check_entry_type CHECK (entry_type IN ('note', 'task'));

-- Add check constraint for priority
ALTER TABLE diary_entries
ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high'));

-- Create index on entry_type for filtering
CREATE INDEX IF NOT EXISTS idx_diary_entries_entry_type ON diary_entries(entry_type);

-- Create index on priority for filtering
CREATE INDEX IF NOT EXISTS idx_diary_entries_priority ON diary_entries(priority);
