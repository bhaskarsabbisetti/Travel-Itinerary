import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateItinerary from './pages/CreateItinerary'
import ViewItinerary from './pages/ViewItinerary'
import AIGenerator from './pages/AIGenerator'
import { Map, Sparkles, Globe, Shield, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function LandingPage() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Get personalized day-by-day itineraries crafted by advanced AI based on your preferences.'
    },
    {
      icon: Globe,
      title: 'Any Destination',
      description: 'From bustling cities to remote islands, plan trips to any destination worldwide.'
    },
    {
      icon: Shield,
      title: 'Smart Budgeting',
      description: 'Stay within budget with cost estimates for activities, meals, and transportation.'
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-32 pb-20 px-4 md:px-8 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Travel Planning</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Plan Your Perfect Trip with{' '}
              <span className="text-primary">AI Intelligence</span>
            </h1>

            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Create personalized day-by-day travel itineraries in seconds. Smart recommendations, budget tracking, and seamless exports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={isAuthenticated ? '#/ai-generate' : '#/login'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Start Planning Free
                <ArrowRight className="w-5 h-5" />
              </a>
              {!isAuthenticated && (
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-border rounded-xl font-semibold text-lg hover:border-primary hover:text-primary transition-all"
                >
                  Learn More
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="bg-surface rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 p-1">
                <div className="bg-surface rounded-t-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop"
                    alt="Travel Planning Dashboard"
                    className="w-full h-64 md:h-96 object-cover rounded-t-2xl"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/30" />
              ))}
              <div className="w-8 h-2 rounded-full bg-primary" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Plan Amazing Trips
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Powerful features designed to make travel planning effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface rounded-2xl p-8 border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-muted text-lg mb-10">
            Join thousands of travelers who plan their trips with AI assistance
          </p>
          <a
            href={isAuthenticated ? '#/dashboard' : '#/login'}
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <footer className="py-12 px-4 md:px-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold">TravelPlan<span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} TravelPlan AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Header />
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <Header />
              <CreateItinerary />
            </ProtectedRoute>
          } />
          <Route path="/itinerary/:id" element={
            <ProtectedRoute>
              <Header />
              <ViewItinerary />
            </ProtectedRoute>
          } />
          <Route path="/ai-generate" element={
            <ProtectedRoute>
              <Header />
              <AIGenerator />
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
