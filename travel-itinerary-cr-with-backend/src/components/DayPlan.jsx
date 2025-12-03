import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, MapPin, DollarSign, Utensils, Camera, Plus, Trash2, Edit, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DayPlan({ day, dayNumber, onUpdate, onDelete, editable = false }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(day)
  const [newActivity, setNewActivity] = useState({ time: '', activity: '', location: '', cost: '' })

  const activities = day?.activities || []
  const meals = day?.meals || []
  const tips = day?.tips || []

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleAddActivity = () => {
    if (newActivity.activity.trim()) {
      setEditData(prev => ({
        ...prev,
        activities: [...(prev.activities || []), { ...newActivity, id: Date.now() }]
      }))
      setNewActivity({ time: '', activity: '', location: '', cost: '' })
    }
  }

  const handleRemoveActivity = (index) => {
    setEditData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }))
  }

  const getActivityIcon = (activity) => {
    const lowerActivity = (activity || '').toLowerCase()
    if (lowerActivity.includes('eat') || lowerActivity.includes('lunch') || lowerActivity.includes('dinner') || lowerActivity.includes('breakfast')) {
      return Utensils
    }
    if (lowerActivity.includes('photo') || lowerActivity.includes('visit') || lowerActivity.includes('explore')) {
      return Camera
    }
    return MapPin
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: dayNumber * 0.1 }}
      className="bg-surface rounded-2xl border border-border/50 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">D{dayNumber}</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{day?.title || `Day ${dayNumber}`}</h3>
            <p className="text-sm text-muted">{activities.length} activities planned</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {day?.estimated_cost && (
            <span className="text-sm font-medium text-success">${day.estimated_cost}</span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50"
          >
            <div className="p-4 space-y-4">
              {editable && !isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Day
                  </button>
                  <button
                    onClick={() => onDelete()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editData?.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Day title"
                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted">Activities</h4>
                    {(editData?.activities || []).map((act, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded-lg">
                        <input
                          type="time"
                          value={act.time || ''}
                          onChange={(e) => {
                            const updated = [...editData.activities]
                            updated[idx] = { ...act, time: e.target.value }
                            setEditData(prev => ({ ...prev, activities: updated }))
                          }}
                          className="px-2 py-1 border border-border rounded-lg text-sm w-24"
                        />
                        <input
                          type="text"
                          value={act.activity || ''}
                          onChange={(e) => {
                            const updated = [...editData.activities]
                            updated[idx] = { ...act, activity: e.target.value }
                            setEditData(prev => ({ ...prev, activities: updated }))
                          }}
                          placeholder="Activity"
                          className="flex-1 px-2 py-1 border border-border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => handleRemoveActivity(idx)}
                          className="p-1 text-danger hover:bg-danger/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                      <input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                        className="px-2 py-1 border border-border rounded-lg text-sm w-24"
                      />
                      <input
                        type="text"
                        value={newActivity.activity}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, activity: e.target.value }))}
                        placeholder="New activity"
                        className="flex-1 px-2 py-1 border border-border rounded-lg text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                      />
                      <button
                        onClick={handleAddActivity}
                        className="p-1 text-primary hover:bg-primary/10 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditData(day) }}
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-background transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activities.length > 0 && (
                    <div className="space-y-3">
                      {activities.map((activity, idx) => {
                        const IconComponent = getActivityIcon(activity.activity)
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-background/50 rounded-xl"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm text-muted mb-1">
                                <Clock className="w-3 h-3" />
                                {activity.time || 'Flexible'}
                              </div>
                              <p className="font-medium text-foreground">{activity.activity}</p>
                              {activity.location && (
                                <p className="text-sm text-muted flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {activity.location}
                                </p>
                              )}
                            </div>
                            {activity.cost && (
                              <span className="text-sm font-medium text-success flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {activity.cost}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {meals.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        Food Recommendations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {meals.map((meal, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-warning/10 text-warning text-sm rounded-lg"
                          >
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tips.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="text-sm font-medium text-muted mb-2">💡 Travel Tips</h4>
                      <ul className="space-y-1">
                        {tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
