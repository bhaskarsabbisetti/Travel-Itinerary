import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, MapPin, Calendar, DollarSign, Loader2, ArrowRight, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG } from '../constants/config'
import DayPlan from '../components/DayPlan'
import { apiFetch } from '../utils/api'

export default function AIGenerator() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedItinerary, setGeneratedItinerary] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    destination: '',
    duration: 5,
    budget_range: 'moderate',
    interests: [],
    travel_style: 'balanced',
    special_requests: ''
  })

  const travelStyles = [
    { id: 'relaxed', label: 'Relaxed', description: 'Slow pace, fewer activities', icon: '🧘' },
    { id: 'balanced', label: 'Balanced', description: 'Mix of activities and rest', icon: '⚖️' },
    { id: 'packed', label: 'Action-Packed', description: 'Maximum experiences', icon: '🚀' }
  ]

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

  const generateItinerary = async () => {
    if (!formData.destination.trim()) {
      setError('Please enter a destination')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await apiFetch('/generate-itinerary', {
        method: 'POST',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate itinerary')
      }

      setGeneratedItinerary(data.itinerary)
      setStep(3)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveItinerary = async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        title: generatedItinerary.title,
        destination: formData.destination,
        days_count: formData.duration,
        budget_range: formData.budget_range,
        interests: formData.interests,
        days_plan: generatedItinerary.days,
        is_ai_generated: true,
        estimated_total_cost: generatedItinerary.estimated_total_cost,
        notes: formData.special_requests
      }

      const response = await apiFetch('/itineraries', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      navigate(`/itinerary/${data.itinerary.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const regenerate = () => {
    setGeneratedItinerary(null)
    setStep(2)
    generateItinerary()
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-600">AI-Powered Planning</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Generate Your Perfect Itinerary
          </h1>
          <p className="text-muted">
            Tell us about your trip and let AI create a personalized day-by-day plan
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s
                  ? 'bg-primary text-white'
                  : 'bg-background border-2 border-border text-muted'
                }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 md:w-24 h-1 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-border'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 md:p-8 border border-border/50"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">Trip Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Where do you want to go?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="e.g., Tokyo, Japan"
                      className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Trip Duration
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-surface"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30].map(d => (
                          <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Budget Range
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <select
                        name="budget_range"
                        value={formData.budget_range}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-surface"
                      >
                        {CONFIG.budgetRanges.map(range => (
                          <option key={range.id} value={range.id}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    What are you interested in?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CONFIG.interests.map(interest => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.interests.includes(interest.id)
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-background border border-border hover:border-primary'
                          }`}
                      >
                        {interest.icon} {interest.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.destination.trim()}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && !loading && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-2xl p-6 md:p-8 border border-border/50"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">Customize Your Experience</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {travelStyles.map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, travel_style: style.id }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.travel_style === style.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <span className="text-2xl mb-2 block">{style.icon}</span>
                        <p className="font-semibold text-foreground">{style.label}</p>
                        <p className="text-sm text-muted">{style.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleChange}
                    placeholder="e.g., Vegetarian food options, wheelchair accessible places, avoid crowded tourist spots..."
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 border border-border rounded-xl font-medium hover:bg-background transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={generateItinerary}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Itinerary
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-surface rounded-2xl p-12 border border-border/50 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Creating Your Perfect Itinerary
              </h3>
              <p className="text-muted">
                Our AI is crafting a personalized day-by-day plan for your trip to {formData.destination}...
              </p>
              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && generatedItinerary && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 mb-6 border border-purple-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {generatedItinerary.title}
                    </h2>
                    <p className="text-muted flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {formData.destination} • {formData.duration} days
                    </p>
                  </div>
                  {generatedItinerary.estimated_total_cost && (
                    <div className="text-right">
                      <p className="text-sm text-muted">Est. Total Cost</p>
                      <p className="text-2xl font-bold text-success">
                        ${generatedItinerary.estimated_total_cost}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {generatedItinerary.overview && (
                <div className="bg-surface rounded-2xl p-6 mb-6 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">Trip Overview</h3>
                  <p className="text-muted">{generatedItinerary.overview}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {(generatedItinerary.days || []).map((day, index) => (
                  <DayPlan
                    key={index}
                    day={day}
                    dayNumber={index + 1}
                    editable={false}
                  />
                ))}
              </div>

              {generatedItinerary.travel_tips && generatedItinerary.travel_tips.length > 0 && (
                <div className="bg-warning/10 rounded-2xl p-6 mb-6 border border-warning/20">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    💡 Travel Tips for {formData.destination}
                  </h3>
                  <ul className="space-y-2">
                    {generatedItinerary.travel_tips.map((tip, idx) => (
                      <li key={idx} className="text-muted flex items-start gap-2">
                        <span className="text-warning">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={regenerate}
                  className="flex items-center justify-center gap-2 px-6 py-4 border border-border rounded-xl font-medium hover:bg-background transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
                <button
                  onClick={saveItinerary}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Itinerary
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
