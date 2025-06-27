import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import PersonalInfo from "./pages/PersonalInfo"
import IndoorHobbies from "./pages/IndoorHobbies"
import OutdoorHobbies from "./pages/OutdoorHobbies"
import OtherHobbies from "./pages/OtherHobbies"
import ActivityLevels from "./pages/ActivityLevels"

const supabase = createClient('https://vueayjtgnwoxzkbnkxdx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE')

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
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
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        // Check if user has completed onboarding
        checkOnboardingStatus(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboardingStatus = async (userId) => {
    // You can check if user data exists in your database
    // For now, we'll assume new users need onboarding
    setOnboardingStep(1)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setOnboardingStep(0)
    setUserData({
      personalInfo: {},
      indoorHobbies: [],
      outdoorHobbies: [],
      otherHobbies: [],
      activityLevel: 0
    })
  }

  const updateUserData = (step, data) => {
    setUserData(prev => ({
      ...prev,
      [step]: data
    }))
  }

  const nextStep = () => {
    setOnboardingStep(prev => prev + 1)
  }

  const completeOnboarding = async () => {
    // Save all user data to database here
    console.log('Complete user data:', userData)
    // After saving, set onboarding as complete
    setOnboardingStep(0)
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
  if (onboardingStep > 0) {
    switch (onboardingStep) {
      case 1:
        return <PersonalInfo 
          onContinue={(data) => {
            updateUserData('personalInfo', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 2:
        return <IndoorHobbies 
          onContinue={(data) => {
            updateUserData('indoorHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 3:
        return <OutdoorHobbies 
          onContinue={(data) => {
            updateUserData('outdoorHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 4:
        return <OtherHobbies 
          onContinue={(data) => {
            updateUserData('otherHobbies', data)
            nextStep()
          }}
          onSkip={nextStep}
        />
      case 5:
        return <ActivityLevels 
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