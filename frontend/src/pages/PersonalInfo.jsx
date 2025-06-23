import Input from "../components/Input"
import Button from "../components/Button"

function PersonalInfo(){
    return(
        <div className="font-sans min-h-screen bg-gray-50">
            {/* Desktop Layout */}
            <div className="hidden md:flex h-screen">
                <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 items-center">
                    <div className="max-w-lg xl:max-w-xl">
                        <h1 className="text-plum text-4xl lg:text-6xl font-bold mb-6">Personal Info</h1>
                        <p className="text-gray-700 text-sm lg:text-md leading-relaxed">
                            Track your mood, write daily journals, and receive personalized self-care tips powered by AI sentiment analysis. MindEase helps you understand your emotional patterns and offers simple guided meditations and CBT exercises tailored to your lifestyle and interests.
                        </p>
                    </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="bg-white shadow-lg/20 rounded-2xl p-8 lg:p-10 w-full max-w-md">
                        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-8 text-gray-800">Personal Info</h2>
                        <div className="space-y-4">
                            <Input hint="Name"/>
                            <Input hint="Date of Birth"/>
                            <Input hint="Biological Sex"/>
                            <Input hint="Gender Identity"/>
                            
                            <div className="pt-2">
                                <Button text="CONTINUE"/>
                            </div>
                            <div className="text-center">
                                <p className="text-sm lg:text-base">Don't want to fill it up now? <a href="#" className="font-medium hover:font-bold transition-all duration-100">Skip</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col min-h-screen justify-center items-center px-6 py-8">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-plum text-4xl font-bold">Personal Info</h1>
                    </div>
                    
                    <div className="space-y-4">
                        <Input hint="Name"/>
                        <Input hint="Date of Birth"/>
                        <Input hint="Biological Sex"/>
                        <Input hint="Gender Identity"/>
                        
                        <div className="pt-2">
                            <Button text="CONTINUE"/>
                        </div>
                        <div className="text-center">
                            <p className="text-sm">Don't want to fill it up now? <a href="#" className="font-medium hover:font-bold transition-all duration-100">Skip</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalInfo;