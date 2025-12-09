import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Download, FileText, Share2, MapPin, Calendar, DollarSign, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import DayPlan from '../components/DayPlan'
import { apiFetch } from '../utils/api'

export default function ViewItinerary() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchItinerary()
  }, [id])

  const fetchItinerary = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/itineraries/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load itinerary')
      }

      setItinerary(data.itinerary)
    } catch (err) {
      console.error('Load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDay = async (dayIndex, updatedDay) => {
    if (!itinerary) return

    const newDays = [...(itinerary.days_plan || [])]
    newDays[dayIndex] = updatedDay

    try {
      const response = await apiFetch(`/itineraries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ days_plan: newDays })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      setItinerary(prev => prev ? { ...prev, days_plan: newDays } : null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteDay = async (dayIndex) => {
    if (!itinerary || !confirm('Delete this day?')) return

    const newDays = (itinerary.days_plan || []).filter((_, i) => i !== dayIndex)

    try {
      const response = await apiFetch(`api/itineraries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ days_plan: newDays, days_count: newDays.length })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setItinerary(prev => prev ? { ...prev, days_plan: newDays, days_count: newDays.length } : null)
    } catch (err) {
      alert(err.message)
    }
  }

  const exportToPDF = async () => {
    if (!itinerary) return
    setExporting(true)

    try {
      const pdf = new jsPDF()
      const margin = 20
      let y = margin

      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(itinerary.title || 'Travel Itinerary', margin, y)
      y += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Destination: ${itinerary.destination || 'N/A'}`, margin, y)
      y += 8

      if (itinerary.start_date && itinerary.end_date) {
        pdf.text(`Dates: ${new Date(itinerary.start_date).toLocaleDateString()} - ${new Date(itinerary.end_date).toLocaleDateString()}`, margin, y)
        y += 8
      }

      if (itinerary.estimated_total_cost) {
        pdf.text(`Estimated Cost: $${itinerary.estimated_total_cost}`, margin, y)
        y += 8
      }

      y += 10

      const days = itinerary.days_plan || []
      days.forEach((day, dayIndex) => {
        if (y > 250) {
          pdf.addPage()
          y = margin
        }

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(day.title || `Day ${dayIndex + 1}`, margin, y)
        y += 10

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        const activities = day.activities || []
        activities.forEach(activity => {
          if (y > 270) {
            pdf.addPage()
            y = margin
          }
          const text = `${activity.time || ''} - ${activity.activity || ''} @ ${activity.location || ''}`
          pdf.text(text, margin + 5, y)
          y += 6
        })

        y += 8
      })

      pdf.save(`${itinerary.title || 'itinerary'}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  const exportToJSON = () => {
    if (!itinerary) return

    const dataStr = JSON.stringify(itinerary, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${itinerary.title || 'itinerary'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="font-medium mb-2">Failed to load itinerary</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-danger/20 rounded-lg hover:bg-danger/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Itinerary not found</p>
      </div>
    )
  }

  const days = itinerary.days_plan || []

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border/50 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {itinerary.title}
                  </h1>
                  {itinerary.is_ai_generated && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 text-xs font-medium rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {itinerary.destination}
                  </span>
                  {itinerary.start_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(itinerary.start_date)}
                    </span>
                  )}
                  {itinerary.estimated_total_cost && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      ${itinerary.estimated_total_cost} estimated
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/create?edit=${id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-background transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={exportToPDF}
                      disabled={exporting}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background text-left rounded-t-xl transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {exporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background text-left rounded-b-xl transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {itinerary.notes && (
              <div className="p-4 bg-background rounded-xl">
                <p className="text-sm text-muted">{itinerary.notes}</p>
              </div>
            )}
          </div>

          {days.length > 0 ? (
            <div className="space-y-4">
              {days.map((day, index) => (
                <DayPlan
                  key={index}
                  day={day}
                  dayNumber={index + 1}
                  editable={true}
                  onUpdate={(updated) => handleUpdateDay(index, updated)}
                  onDelete={() => handleDeleteDay(index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border/50">
              <p className="text-muted mb-4">No day plans added yet</p>
              <Link
                to={`/create?edit=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl"
              >
                <Edit className="w-4 h-4" />
                Add Day Plans
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
