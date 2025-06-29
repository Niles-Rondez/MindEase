import { useState } from "react"
import { createClient } from '@supabase/supabase-js'
import Input from "../components/Input"
import Button from "../components/Button"
import logo from "../assets/logo.png";

const supabase = createClient('https://vueayjtgnwoxzkbnkxdx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZWF5anRnbndveHprYm5reGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njg0MTAsImV4cCI6MjA2NjM0NDQxMH0.qjqzNIkfpTp6JyRd60C7sEoLzz0Kw6t8Te1j8kGr0VE')

function Login({ onSwitchToSignup }){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validateForm = () => {
        if (!email.trim()) {
            setError('Email is required')
            return false
        }

        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address')
            return false
        }

        if (!password) {
            setError('Password is required')
            return false
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return false
        }

        return true
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            })

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please check your credentials and try again.')
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Please verify your email address before logging in.')
                } else if (error.message.includes('Too many requests')) {
                    setError('Too many login attempts. Please wait a moment before trying again.')
                } else {
                    setError(error.message)
                }
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className="min-h-screen font-sans bg-gray-50">
            {/* Desktop Layout */}
            <div className="hidden h-screen md:flex">
                <div className="flex flex-col items-center justify-center flex-1 px-8 lg:px-12 xl:px-16">
                    <div className="max-w-lg xl:max-w-xl">
                        <div className="flex items-center mb-6 space-x-5 align-bottom">
                            <img src={logo} alt="Logo" className="w-16 lg:w-20"/>
                            <h1 className="text-4xl font-bold text-plum lg:text-6xl">MindEase</h1>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700 lg:text-md">
                            Track your mood, write daily journals, and receive personalized self-care tips powered by AI sentiment analysis. MindEase helps you understand your emotional patterns and offers simple guided meditations and CBT exercises tailored to your lifestyle and interests.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center justify-center flex-1 px-8 lg:px-12">
                    <div className="w-full max-w-md p-8 bg-white shadow-lg/20 rounded-2xl lg:p-10">
                        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 lg:text-3xl lg:mb-8">Login</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                    {error}
                                </div>
                            )}
                            <Input 
                                hint="Email address" 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input 
                                hint="Password" 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            <div className="pt-2">
                                <Button 
                                    text={loading ? "LOGGING IN..." : "LOG IN"} 
                                    type="submit"
                                    disabled={loading}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Don't have an account with us? 
                                    <button 
                                        type="button"
                                        onClick={onSwitchToSignup}
                                        className="ml-1 font-medium text-black transition-all duration-200 hover:text-plum hover:font-bold hover:cursor-pointer"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 md:hidden">
                <div className="w-full max-w-sm">
                    <div className="flex items-center justify-center mb-8 space-x-4">
                        <img src={logo} alt="Logo" className="w-16"/>
                        <h1 className="text-4xl font-bold text-plum">MindEase</h1>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                {error}
                            </div>
                        )}
                        <Input 
                            hint="Email address" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input 
                            hint="Password" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        <div className="pt-2">
                            <Button 
                                text={loading ? "LOGGING IN..." : "LOG IN"} 
                                type="submit"
                                disabled={loading}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account with us? 
                                <button 
                                    type="button"
                                    onClick={onSwitchToSignup}
                                    className="ml-1 font-medium text-black transition-all duration-200 hover:text-plum hover:font-bold hover:cursor-pointer"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;