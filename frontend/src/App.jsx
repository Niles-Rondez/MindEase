// import { useState, useEffect } from 'react'
// import { createClient } from '@supabase/supabase-js'
// import Login from "./pages/Login"
// import Signup from "./pages/Signup"
// import PersonalInfo from "./pages/PersonalInfo"

// const supabase = createClient('https://vueayjtgnwoxzkbnkxdx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE')

// export default function App() {
//   const [session, setSession] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [showSignup, setShowSignup] = useState(false)

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//       setLoading(false)
//     })

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const handleSignOut = async () => {
//     await supabase.auth.signOut()
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="w-32 h-32 mx-auto border-b-2 rounded-full animate-spin border-lilac"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   // Not authenticated - show login/signup
//   if (!session) {
//     return showSignup ? (
//       <Signup onSwitchToLogin={() => setShowSignup(false)} />
//     ) : (
//       <Login onSwitchToSignup={() => setShowSignup(true)} />
//     )
//   }

//   // Authenticated - show main app
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white border-b shadow-sm">
//         <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between py-4">
//             <h1 className="text-2xl font-bold text-plum">MindEase</h1>
//             <div className="flex items-center space-x-4">
//               <span className="text-gray-600">Welcome, {session.user.email}</span>
//               <button
//                 onClick={handleSignOut}
//                 className="px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
//               >
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>
      
//       <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
//         <div className="text-center">
//           <h2 className="mb-4 text-3xl font-bold text-gray-800">Dashboard</h2>
//           <p className="mb-8 text-gray-600">Welcome to your MindEase dashboard!</p>
          
//           {/* You can add your PersonalInfo component or other authenticated content here */}
//           <div className="p-6 bg-white rounded-lg shadow">
//             <h3 className="mb-4 text-xl font-semibold">Your Journey Starts Here</h3>
//             <p className="text-gray-600">
//               This is where your mood tracking, journaling, and personalized self-care features will live.
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }


import ActivityLevels from "./pages/ActivityLevels";
import PersonalInfo from "./pages/PersonalInfo";
import IndoorHobbies from "./pages/IndoorHobbies";
import OutdoorHobbies from "./pages/OutdoorHobbies";
import OtherHobbies from "./pages/OtherHobbies";

export default function App() {
  return (
    <>
      <PersonalInfo />
      <IndoorHobbies />
      <OutdoorHobbies />
      <OtherHobbies />
      <ActivityLevels />
    </>
  );
}