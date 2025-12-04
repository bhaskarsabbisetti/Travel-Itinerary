import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Calendar, MapPin, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { CONFIG } from '../constants/config'
import { apiFetch } from '../utils/api'

export default function CreateItinerary() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget_range: 'moderate',
    interests: [],
    notes: ''
  })

  const [days, setDays] = useState([{
    title: 'Day 1',
    activities: [{ time: '09:00', activity: '', location: '', cost: '' }],
    meals: [],
    tips: []
  }])

  useEffect(() => {
    if (editId) {
      fetchItinerary()
    }
  }, [editId])

  /** FIXED URL */
  const fetchItinerary = async () => {
    try {
      setLoading(true)

      const response = await apiFetch(`/itineraries/${editId}/`, {
        method: "GET"
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to load")

      const itinerary = data.itinerary

      setFormData({
        title: itinerary.title || '',
        destination: itinerary.destination || '',
        start_date: itinerary.start_date?.split('T')[0] || '',
        end_date: itinerary.end_date?.split('T')[0] || '',
        budget_range: itinerary.budget_range || 'moderate',
        interests: itinerary.interests || [],
        notes: itinerary.notes || ''
      })

      if (itinerary.days_plan?.length) {
        setDays(itinerary.days_plan)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }))
  }

  const addDay = () => {
    setDays(prev => [...prev, {
      title: `Day ${prev.length + 1}`,
      activities: [{ time: '09:00', activity: '', location: '', cost: '' }],
      meals: [],
      tips: []
    }])
  }

  const removeDay = (index) => {
    if (days.length === 1) return
    setDays(prev => prev.filter((_, i) => i !== index))
  }

  const updateDay = (index, field, value) => {
    setDays(prev => prev.map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    ))
  }

  const addActivity = (dayIndex) => {
    setDays(prev => prev.map((day, i) =>
      i === dayIndex
        ? { ...day, activities: [...day.activities, { time: '', activity: '', location: '', cost: '' }] }
        : day
    ))
  }

  const updateActivity = (dayIndex, actIndex, field, value) => {
    setDays(prev => prev.map((day, i) =>
      i === dayIndex
        ? {
          ...day,
          activities: day.activities.map((act, j) =>
            j === actIndex ? { ...act, [field]: value } : act
          )
        }
        : day
    ))
  }

  const removeActivity = (dayIndex, actIndex) => {
    setDays(prev => prev.map((day, i) =>
      i === dayIndex
        ? { ...day, activities: day.activities.filter((_, j) => j !== actIndex) }
        : day
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const payload = {
        ...formData,
        days_plan: days,
        days_count: days.length
      }

      /** FIXED URL */
      const endpoint = editId
        ? `/itineraries/${editId}/`
        : `/itineraries/`

      const method = editId ? "PUT" : "POST"

      const response = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to save')

      navigate(`/itinerary/${data.itinerary.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {editId ? 'Edit Itinerary' : 'Create New Itinerary'}
          </h1>
          <p className="text-muted mb-8">Plan your perfect trip step by step</p>

          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-surface rounded-2xl p-6 border border-border/50 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Trip Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Trip Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Adventure in Japan"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g., Tokyo, Japan"
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date}
                      className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <select
                    name="budget_range"
                    value={formData.budget_range}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-surface"
                  >
                    {CONFIG.budgetRanges.map(range => (
                      <option key={range.id} value={range.id}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {CONFIG.interests.map(interest => (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.interests.includes(interest.id)
                          ? 'bg-primary text-white'
                          : 'bg-background border border-border hover:border-primary'
                        }`}
                    >
                      {interest.icon} {interest.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Day-by-Day Plan</h2>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </button>
              </div>

              <div className="space-y-6">
                {days.map((day, dayIndex) => (
                  <div key={dayIndex} className="p-4 bg-background rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
                        placeholder={`Day ${dayIndex + 1}`}
                      />
                      {days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(dayIndex)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center gap-3">
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'time', e.target.value)}
                            className="w-24 px-3 py-2 border border-border rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            value={activity.activity}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'activity', e.target.value)}
                            placeholder="Activity description"
                            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            value={activity.location}
                            onChange={(e) => updateActivity(dayIndex, actIndex, 'location', e.target.value)}
                            placeholder="Location"
                            className="w-32 px-3 py-2 border border-border rounded-lg text-sm hidden md:block"
                          />
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, actIndex)}
                            className="p-2 text-muted hover:text-danger transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addActivity(dayIndex)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Plus className="w-4 h-4" />
                        Add activity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editId ? 'Save Changes' : 'Create Itinerary'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
