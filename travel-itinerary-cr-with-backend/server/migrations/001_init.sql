-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget_range TEXT DEFAULT 'moderate',
  interests TEXT[] DEFAULT '{}',
  days_plan JSONB DEFAULT '[]',
  days_count INTEGER DEFAULT 1,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  estimated_total_cost NUMERIC(10,2),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS destination TEXT DEFAULT '';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS budget_range TEXT DEFAULT 'moderate';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS days_plan JSONB DEFAULT '[]';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS days_count INTEGER DEFAULT 1;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS estimated_total_cost NUMERIC(10,2);
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_destination ON itineraries(destination);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
