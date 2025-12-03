import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Map, Plus, Sparkles, LogOut, User, Home } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = isAuthenticated ? [
    { to: '/dashboard', label: 'My Trips', icon: Home },
    { to: '/create', label: 'New Trip', icon: Plus },
    { to: '/ai-generate', label: 'AI Planner', icon: Sparkles }
  ] : []

  const isActive = (path) => location.pathname === path

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-surface/80 border-b border-border/50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              TravelPlan<span className="text-primary">AI</span>
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive(link.to)
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-foreground hover:bg-background'
                    }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background">
                  <User className="w-4 h-4 text-muted" />
                  <span className="text-sm font-medium">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-muted hover:text-danger transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 min-h-[44px] min-w-[44px] rounded-lg hover:bg-background transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(link.to)
                          ? 'bg-primary text-white'
                          : 'text-muted hover:bg-background'
                        }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false) }}
                    className="flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 bg-primary text-white text-center rounded-xl font-medium"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
