import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles, Map, Calendar, Search, Filter, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ItineraryCard from '../components/ItineraryCard'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../utils/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAI, setFilterAI] = useState('all')

  useEffect(() => {
    fetchItineraries()
  }, [])

  const fetchItineraries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch('/api/itineraries')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load itineraries')
      }

      setItineraries(data.itineraries || [])
    } catch (err) {
      console.error('Load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return

    try {
      const response = await apiFetch(`/api/itineraries/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setItineraries(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredItineraries = (itineraries || []).filter(itinerary => {
    const matchesSearch = !searchQuery ||
      itinerary.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itinerary.destination?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterAI === 'all' ||
      (filterAI === 'ai' && itinerary.is_ai_generated) ||
      (filterAI === 'manual' && !itinerary.is_ai_generated)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: itineraries.length,
    aiGenerated: itineraries.filter(i => i.is_ai_generated).length,
    upcoming: itineraries.filter(i => i.start_date && new Date(i.start_date) > new Date()).length
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
          >
            Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}! 👋
          </motion.h1>
          <p className="text-muted">Manage your travel itineraries and plan new adventures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted">Total Trips</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.aiGenerated}</p>
                <p className="text-sm text-muted">AI Generated</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.upcoming}</p>
                <p className="text-sm text-muted">Upcoming</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Link
            to="/create"
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New Trip
          </Link>
          <Link
            to="/ai-generate"
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Generate with AI
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted" />
            <select
              value={filterAI}
              onChange={(e) => setFilterAI(e.target.value)}
              className="px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Trips</option>
              <option value="ai">AI Generated</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 text-center">
            <p className="font-medium mb-2">Failed to load itineraries</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchItineraries}
              className="mt-4 px-4 py-2 bg-danger/20 rounded-lg hover:bg-danger/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Map className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-muted mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start planning your first adventure!'}
            </p>
            {!searchQuery && (
              <Link
                to="/ai-generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generate with AI
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
