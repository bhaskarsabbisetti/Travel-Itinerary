import express, { Request, Response } from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { supabase, getTableName, isSupabaseReady } from './lib/supabase.js'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'travel-planner-secret-key'

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// Types
interface User {
  id: string
  email: string
  name: string
  preferences?: Record<string, unknown>
}

interface AuthRequest extends Request {
  user?: User
}

// Auth middleware
const authMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    if (!isSupabaseReady() || !supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { data: user, error } = await supabase
      .from(getTableName('users'))
      .select('id, email, name, preferences')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user as User
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Initialize OpenAI
let openai: OpenAI | null = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { email, password, name } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Check existing user
    const { data: existing } = await supabase
      .from(getTableName('users'))
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    const { data: user, error } = await supabase
      .from(getTableName('users'))
      .insert({
        id: userId,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        name: name || email.split('@')[0],
        preferences: {}
      })
      .select('id, email, name, preferences')
      .single()

    if (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Failed to create account', details: error.message })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Unexpected error:', err)
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Registration failed', details: message })
  }
})

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase) {
      return res.status(503).json({ error: 'Database not configured' })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data: user, error } = await supabase
      .from(getTableName('users'))
      .select('id, email, name, preferences, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password_hash, ...safeUser } = user

    res.json({ user: safeUser, token })
  } catch (err) {
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Login failed', details: message })
  }
})

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true })
})

// ==================== USER ROUTES ====================

app.put('/api/user/preferences', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const { data, error } = await supabase
      .from(getTableName('users'))
      .update({ preferences: req.body })
      .eq('id', req.user.id)
      .select('preferences')
      .single()

    if (error) {
      return res.status(500).json({ error: 'Failed to update', details: error.message })
    }

    res.json({ preferences: data.preferences })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Update failed', details: message })
  }
})

// ==================== ITINERARY ROUTES ====================

app.get('/api/itineraries', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const { data, error } = await supabase
      .from(getTableName('itineraries'))
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch', details: error.message })
    }

    res.json({ itineraries: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Fetch failed', details: message })
  }
})

app.get('/api/itineraries/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const { data, error } = await supabase
      .from(getTableName('itineraries'))
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Itinerary not found' })
    }

    res.json({ itinerary: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Fetch failed', details: message })
  }
})

app.post('/api/itineraries', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const {
      title,
      destination,
      start_date,
      end_date,
      budget_range,
      interests,
      days_plan,
      days_count,
      is_ai_generated,
      estimated_total_cost,
      notes
    } = req.body

    if (!title || !destination) {
      return res.status(400).json({ error: 'Title and destination required' })
    }

    const { data, error } = await supabase
      .from(getTableName('itineraries'))
      .insert({
        id: uuidv4(),
        user_id: req.user.id,
        title,
        destination,
        start_date: start_date || null,
        end_date: end_date || null,
        budget_range: budget_range || 'moderate',
        interests: interests || [],
        days_plan: days_plan || [],
        days_count: days_count || (days_plan?.length || 1),
        is_ai_generated: is_ai_generated || false,
        estimated_total_cost: estimated_total_cost || null,
        notes: notes || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Create error:', error)
      return res.status(500).json({ error: 'Failed to create', details: error.message })
    }

    res.status(201).json({ itinerary: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Create failed', details: message })
  }
})

app.put('/api/itineraries/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const allowedFields = [
      'title', 'destination', 'start_date', 'end_date',
      'budget_range', 'interests', 'days_plan', 'days_count',
      'notes', 'estimated_total_cost'
    ]

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    }

    const { data, error } = await supabase
      .from(getTableName('itineraries'))
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return res.status(500).json({ error: 'Failed to update', details: error.message })
    }

    res.json({ itinerary: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Update failed', details: message })
  }
})

app.delete('/api/itineraries/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!isSupabaseReady() || !supabase || !req.user) {
      return res.status(503).json({ error: 'Service unavailable' })
    }

    const { error } = await supabase
      .from(getTableName('itineraries'))
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) {
      return res.status(500).json({ error: 'Failed to delete', details: error.message })
    }

    res.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ error: 'Delete failed', details: message })
  }
})

// ==================== AI GENERATION ROUTE ====================

app.post('/api/generate-itinerary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { destination, duration, budget_range, interests, travel_style, special_requests } = req.body

    if (!destination) {
      return res.status(400).json({ error: 'Destination required' })
    }

    if (!openai) {
      // Return mock data if OpenAI not configured
      const mockItinerary = generateMockItinerary(destination, duration, budget_range, interests)
      return res.json({ itinerary: mockItinerary })
    }

    const budgetMap: Record<string, string> = {
      budget: '$0-50 per day',
      moderate: '$50-150 per day',
      comfortable: '$150-300 per day',
      luxury: '$300+ per day'
    }

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.

Budget: ${budgetMap[budget_range] || 'moderate'}
Interests: ${(interests || []).join(', ') || 'general sightseeing'}
Travel Style: ${travel_style || 'balanced'}
${special_requests ? `Special Requests: ${special_requests}` : ''}

Generate a JSON response with this exact structure:
{
  "title": "Creative trip title",
  "overview": "Brief 2-3 sentence overview of the trip",
  "estimated_total_cost": number (total estimated cost in USD),
  "days": [
    {
      "title": "Day 1: Theme/Area",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity description",
          "location": "Specific location name",
          "cost": "estimated cost or Free"
        }
      ],
      "meals": ["Restaurant/food recommendation 1", "Restaurant 2"],
      "tips": ["Practical tip for this day"],
      "estimated_cost": number
    }
  ],
  "travel_tips": ["General tip 1", "General tip 2", "General tip 3"]
}

Make activities specific with real place names. Include 4-6 activities per day depending on travel style. Provide realistic cost estimates.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert travel planner. Always respond with valid JSON only, no markdown.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const content = completion.choices[0]?.message?.content || ''

    let itinerary
    try {
      // Clean potential markdown
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      itinerary = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content)
      // Return mock if parsing fails
      itinerary = generateMockItinerary(destination, duration, budget_range, interests)
    }

    res.json({ itinerary })
  } catch (err) {
    console.error('AI generation error:', err)
    const message = err instanceof Error ? err.message : String(err)

    // Return mock on any error
    const mockItinerary = generateMockItinerary(
      req.body.destination,
      req.body.duration,
      req.body.budget_range,
      req.body.interests
    )
    res.json({ itinerary: mockItinerary })
  }
})

function generateMockItinerary(
  destination: string,
  duration: number = 5,
  budget_range: string = 'moderate',
  interests: string[] = []
) {
  const days = []
  const activitiesPool = [
    { activity: 'Visit the main historical district', location: 'Old Town Center', cost: 'Free' },
    { activity: 'Explore local market', location: 'Central Market', cost: '$10-20' },
    { activity: 'Museum visit', location: 'National Museum', cost: '$15' },
    { activity: 'Walking tour of landmarks', location: 'City Center', cost: '$25' },
    { activity: 'Local cuisine food tour', location: 'Food District', cost: '$40' },
    { activity: 'Sunset viewpoint', location: 'Panorama Point', cost: 'Free' },
    { activity: 'Traditional performance', location: 'Cultural Center', cost: '$30' },
    { activity: 'Day trip to nearby attraction', location: 'Surrounding Area', cost: '$50' }
  ]

  for (let i = 1; i <= duration; i++) {
    const dayActivities = []
    const times = ['09:00', '11:00', '13:00', '15:00', '18:00']

    for (let j = 0; j < 5; j++) {
      const activityIndex = (i + j) % activitiesPool.length
      dayActivities.push({
        time: times[j],
        ...activitiesPool[activityIndex]
      })
    }

    days.push({
      title: `Day ${i}: Exploring ${destination}`,
      activities: dayActivities,
      meals: [`Local breakfast spot`, `Traditional lunch restaurant`, `Dinner at popular eatery`],
      tips: [`Book attractions in advance for day ${i}`, `Carry comfortable walking shoes`],
      estimated_cost: budget_range === 'budget' ? 50 : budget_range === 'luxury' ? 300 : 120
    })
  }

  const totalCost = days.reduce((sum, day) => sum + (day.estimated_cost || 0), 0)

  return {
    title: `${duration}-Day Adventure in ${destination}`,
    overview: `Experience the best of ${destination} with this carefully crafted ${duration}-day itinerary. From cultural landmarks to local cuisine, this trip covers the essential experiences.`,
    estimated_total_cost: totalCost,
    days,
    travel_tips: [
      `Best time to visit ${destination} is during shoulder season for fewer crowds`,
      `Download offline maps before your trip`,
      `Learn a few basic phrases in the local language`,
      `Keep copies of important documents`,
      `Check visa requirements well in advance`
    ]
  }
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isSupabaseReady(),
    ai: !!openai
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
