import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import PersonalInfo from "./pages/PersonalInfo"
import IndoorHobbies from "./pages/IndoorHobbies"
import OutdoorHobbies from "./pages/OutdoorHobbies"
import OtherHobbies from "./pages/OtherHobbies"
import ActivityLevels from "./pages/ActivityLevels"
import Dashboard from './pages/Dashboard'

const supabase = createClient('https://vueayjtgnwoxzkbnkxdx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE')

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [userData, setUserData] = useState({
    personalInfo: {},
    indoorHobbies: [],
    outdoorHobbies: [],
    otherHobbies: [],
    activityLevel: 0
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        checkOnboardingStatus(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        checkOnboardingStatus(session.user.id)
      } else {
        // Reset state when user signs out
        setOnboardingStep(0)
        setOnboardingComplete(false)
        setUserData({
          personalInfo: {},
          indoorHobbies: [],
          outdoorHobbies: [],
          otherHobbies: [],
          activityLevel: 0
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboardingStatus = async (userId) => {
    try {
      // Check if user has completed onboarding in your database
      // For now, we'll check localStorage as a fallback
      const savedOnboardingStatus = localStorage.getItem(`onboarding_${userId}`)
      const savedUserData = localStorage.getItem(`userData_${userId}`)
      
      if (savedOnboardingStatus === 'complete' && savedUserData) {
        setOnboardingComplete(true)
        setUserData(JSON.parse(savedUserData))
        setOnboardingStep(0)
      } else {
        // Check if there's a saved onboarding step
        const savedStep = localStorage.getItem(`onboardingStep_${userId}`)
        if (savedStep) {
          setOnboardingStep(parseInt(savedStep))
        } else {
          setOnboardingStep(1) // Start onboarding
        }
        setOnboardingComplete(false)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setOnboardingStep(1) // Default to start onboarding
      setOnboardingComplete(false)
    }
  }

  const handleSignOut = async () => {
    const userId = session?.user?.id
    if (userId) {
      // Clear user-specific data from localStorage
      localStorage.removeItem(`onboarding_${userId}`)
      localStorage.removeItem(`userData_${userId}`)
      localStorage.removeItem(`onboardingStep_${userId}`)
    }
    
    await supabase.auth.signOut()
    setOnboardingStep(0)
    setOnboardingComplete(false)
    setUserData({
      personalInfo: {},
      indoorHobbies: [],
      outdoorHobbies: [],
      otherHobbies: [],
      activityLevel: 0
    })
  }

  const updateUserData = (step, data) => {
    const newUserData = {
      ...userData,
      [step]: data
    }
    setUserData(newUserData)
    
    // Save to localStorage for persistence
    if (session?.user?.id) {
      localStorage.setItem(`userData_${session.user.id}`, JSON.stringify(newUserData))
    }
  }

  const nextStep = () => {
    const newStep = onboardingStep + 1
    setOnboardingStep(newStep)
    
    // Save current step to localStorage
    if (session?.user?.id) {
      localStorage.setItem(`onboardingStep_${session.user.id}`, newStep.toString())
    }
  }

  const completeOnboarding = async () => {
    try {
      // Save all user data to database here
      console.log('Complete user data:', userData)
      
      // Mark onboarding as complete
      setOnboardingComplete(true)
      setOnboardingStep(0)
      
      // Save completion status to localStorage
      if (session?.user?.id) {
        localStorage.setItem(`onboarding_${session.user.id}`, 'complete')
        localStorage.removeItem(`onboardingStep_${session.user.id}`) // Clean up step tracking
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto border-b-2 rounded-full animate-spin border-lilac"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login/signup
  if (!session) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  // Authenticated but needs onboarding
  if (!onboardingComplete && onboardingStep > 0) {
    switch (onboardingStep) {
      case 1:
        return <PersonalInfo 
        userId={session?.user?.id} //pass the userid for personal info
          onContinue={(data) => {
            updateUserData('personalInfo', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 2:
        return <IndoorHobbies 
        userId={session?.user?.id}
          onContinue={(data) => {
            updateUserData('indoorHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 3:
        return <OutdoorHobbies
        userId={session?.user?.id} 
          onContinue={(data) => {
            updateUserData('outdoorHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 4:
        return <OtherHobbies
        userId={session?.user?.id} 
          onContinue={(data) => {
            updateUserData('otherHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 5:
        return <ActivityLevels
        userId={session?.user?.id} 
          onContinue={(data) => {
            updateUserData('activityLevel', data)
            completeOnboarding()
          }}
          onSkip={completeOnboarding}
        />
      default:
        return null
    }
  }

  // Authenticated and onboarding complete - show main app
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-plum">MindEase</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Welcome to MindEase!</h2>
          <p className="mb-8 text-gray-600">Your personalized mental wellness journey starts here.</p>
          <Dashboard />
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-xl font-semibold">Your Profile Summary</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-lilac/10">
                <h4 className="font-semibold text-plum">Indoor Hobbies</h4>
                <p className="text-sm text-gray-600">{userData.indoorHobbies.length} selected</p>
              </div>
              <div className="p-4 rounded-lg bg-lilac/10">
                <h4 className="font-semibold text-plum">Outdoor Hobbies</h4>
                <p className="text-sm text-gray-600">{userData.outdoorHobbies.length} selected</p>
              </div>
              <div className="p-4 rounded-lg bg-lilac/10">
                <h4 className="font-semibold text-plum">Other Interests</h4>
                <p className="text-sm text-gray-600">{userData.otherHobbies.length} selected</p>
              </div>
              <div className="p-4 rounded-lg bg-lilac/10">
                <h4 className="font-semibold text-plum">Activity Level</h4>
                <p className="text-sm text-gray-600">Level {userData.activityLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}