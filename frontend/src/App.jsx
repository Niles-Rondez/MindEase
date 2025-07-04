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
import Logbook from './pages/Logbook'
import Insights from './pages/Insights'
import Layout from './components/Layout'

const supabase = createClient('https://vueayjtgnwoxzkbnkxdx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE')

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [currentPage, setCurrentPage] = useState('insights') // Default to insights
  const [userData, setUserData] = useState({
    personalInfo: {},
    indoorHobbies: [],
    outdoorHobbies: [],
    otherHobbies: [],
    activityLevel: 0
  })

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await checkOnboardingStatus(session.user.id);
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        setLoading(true);
        await checkOnboardingStatus(session.user.id);
        setLoading(false);
      } else {
        setOnboardingStep(0);
        setOnboardingComplete(false);
        setCurrentPage('insights');
        setUserData({
          personalInfo: {},
          indoorHobbies: [],
          outdoorHobbies: [],
          otherHobbies: [],
          activityLevel: 0
        });
      }
    });

    return () => subscription.unsubscribe()
  }, [])

  const checkOnboardingStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const result = await response.json();

      if (result.success && result.onboarding_complete === true) {
        setOnboardingComplete(true);
        setOnboardingStep(0);
      } else {
        const savedStep = localStorage.getItem(`onboardingStep_${userId}`);
        setOnboardingStep(savedStep ? parseInt(savedStep) : 1);
        setOnboardingComplete(false);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setOnboardingStep(1);
      setOnboardingComplete(false);
    }
  };

  const handleSignOut = async () => {
    const userId = session?.user?.id
    if (userId) {
      localStorage.removeItem(`onboarding_${userId}`)
      localStorage.removeItem(`userData_${userId}`)
      localStorage.removeItem(`onboardingStep_${userId}`)
    }
    
    await supabase.auth.signOut()
    setOnboardingStep(0)
    setOnboardingComplete(false)
    setCurrentPage('insights')
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
    
    if (session?.user?.id) {
      localStorage.setItem(`userData_${session.user.id}`, JSON.stringify(newUserData))
    }
  }

  const nextStep = () => {
    const newStep = onboardingStep + 1
    setOnboardingStep(newStep)
    
    if (session?.user?.id) {
      localStorage.setItem(`onboardingStep_${session.user.id}`, newStep.toString())
    }
  }

  const completeOnboarding = async () => {
    try {
      console.log('Complete user data:', userData)
      
      setOnboardingComplete(true)
      setOnboardingStep(0)
      
      if (session?.user?.id) {
        localStorage.setItem(`onboarding_${session.user.id}`, 'complete')
        localStorage.removeItem(`onboardingStep_${session.user.id}`)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const navigateToPage = (page) => {
    setCurrentPage(page);
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userId={session?.user?.id} />;
      case 'logbook':
        return <Logbook userId={session?.user?.id} />;
      case 'insights':
      default:
        return <Insights userId={session?.user?.id} />;
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
          userId={session?.user?.id}
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

  // Authenticated and onboarding complete - show main app with layout
  return (
    <Layout 
      userId={session?.user?.id}
      currentPage={currentPage}
      onNavigate={navigateToPage}
      onSignOut={handleSignOut}
    >
      <div className="flex flex-col items-center w-full min-h-screen">
        <div className="w-full mx-auto max-w-7xl">
          {renderCurrentPage()}
        </div>
      </div>
    </Layout>
  )
}