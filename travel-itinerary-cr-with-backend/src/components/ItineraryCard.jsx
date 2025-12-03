import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Trash2, Edit, Eye, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ItineraryCard({ itinerary, onDelete }) {
  const { id, title, destination, start_date, end_date, budget_range, is_ai_generated, days_count } = itinerary

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDuration = () => {
    if (!start_date || !end_date) return days_count ? `${days_count} days` : 'Not set'
    const start = new Date(start_date)
    const end = new Date(end_date)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return `${days} days`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

        {is_ai_generated && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-full">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-foreground line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1.5 text-muted mt-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{destination}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 text-sm text-muted mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{getDuration()}</span>
          </div>
          {budget_range && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span className="capitalize">{budget_range}</span>
            </div>
          )}
        </div>

        {start_date && (
          <p className="text-xs text-muted mb-4">
            {formatDate(start_date)} - {formatDate(end_date)}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/itinerary/${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          <Link
            to={`/create?edit=${id}`}
            className="p-2.5 border border-border rounded-xl hover:border-primary hover:text-primary transition-all"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(id)}
            className="p-2.5 border border-border rounded-xl hover:border-danger hover:text-danger transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
