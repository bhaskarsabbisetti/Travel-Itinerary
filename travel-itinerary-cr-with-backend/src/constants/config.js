export const CONFIG = {
  api: {
    baseURL: import.meta.env.VITE_BACKEND_URL + '/api',
    timeout: 30000
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 50
  },
  interests: [
    { id: 'nature', label: 'Nature & Outdoors', icon: '🌿' },
    { id: 'adventure', label: 'Adventure & Sports', icon: '🎯' },
    { id: 'culture', label: 'Culture & History', icon: '🏛️' },
    { id: 'food', label: 'Food & Cuisine', icon: '🍽️' },
    { id: 'nightlife', label: 'Nightlife & Entertainment', icon: '🎉' },
    { id: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'photography', label: 'Photography', icon: '📷' }
  ],
  budgetRanges: [
    { id: 'budget', label: 'Budget ($0-50/day)', min: 0, max: 50 },
    { id: 'moderate', label: 'Moderate ($50-150/day)', min: 50, max: 150 },
    { id: 'comfortable', label: 'Comfortable ($150-300/day)', min: 150, max: 300 },
    { id: 'luxury', label: 'Luxury ($300+/day)', min: 300, max: 1000 }
  ]
}
