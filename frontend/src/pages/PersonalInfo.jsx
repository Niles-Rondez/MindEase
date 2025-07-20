import React, { useState } from 'react';
import Input from "../components/Input"
import Button from "../components/Button"
import ProgressBar from "../components/ProgressBar"
import GenderSlider from "../components/GenderSlider"
import Dropdown from "../components/Dropdown"

function PersonalInfo({ userId, onContinue, onSkip }){
    const [selectedGender, setSelectedGender] = useState('');
    const [genderIdentity, setGenderIdentity] = useState('');
    const [name, setName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const genderIdentityOptions = [
        'Man', 'Woman', 'Non-binary', 'Genderfluid', 'Agender', 
        'Transgender', 'Two-spirit', 'Other', 'Prefer not to say'
    ];

    const handleContinue = async () => {
        if (!userId) {
            setError('User ID is missing. Please try logging in again.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Format the birthdate as DD-MM-YYYY
            const birthdate = year && month && day ? 
                `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}` : null;

            const personalData = {
                userId: userId,
                first_name: name,
                birthdate: birthdate,
                sex: selectedGender,
                gender_identity: genderIdentity,
                onboarding_complete: false 
            };

            const response = await fetch('http://localhost:3000/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userId,
                    first_name: name,
                    birthdate: birthdate,
                    sex: selectedGender,
                    gender_identity: genderIdentity,
                    onboarding_complete: false
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save personal information');
            }

            console.log('Personal info saved successfully:', result);
            onContinue(personalData);

        } catch (error) {
            console.error('Error saving personal info:', error);
            setError(error.message || 'Failed to save personal information. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleSkip = () => {
        onSkip()
    }
    return(
        <div className="min-h-screen font-sans bg-gray-50">
            {/* Desktop Layout */}
            <div className="hidden h-screen md:flex">                
                <div className="flex items-center justify-center flex-1 px-8">
                    <div className="w-full max-w-md">
                        {/* Progress Bar */}
                        <ProgressBar currentStep={1} totalSteps={5} />
                        
                        <div className="p-8 bg-white shadow-lg/20 rounded-2xl lg:p-10">
                            <h2 className="mb-6 text-2xl font-bold text-plum lg:text-3xl lg:mb-8">Welcome! Let's start with your info.</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="Name" className="block px-2 mb-lg text-black/50 font-inter">Name</label>
                                    <Input 
                                        hint="Enter your name" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block px-2 mb-lg text-black/50 font-inter">Date of Birth</label>
                                    <div className="flex space-x-3">
                                        <div className="flex-1">
                                            <Input 
                                                hint="Day" 
                                                value={day}
                                                onChange={(e) => setDay(e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input 
                                                hint="Month" 
                                                value={month}
                                                onChange={(e) => setMonth(e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input 
                                                hint="Year" 
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <GenderSlider 
                                    selectedGender={selectedGender}
                                    onGenderChange={setSelectedGender}
                                />

                                <Dropdown 
                                    hint="Select your gender identity"
                                    options={genderIdentityOptions}
                                    value={genderIdentity}
                                    onChange={setGenderIdentity}
                                />
                                
                                <div className="pt-2">
                                    <Button text="CONTINUE" onClick={handleContinue}/>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm lg:text-base">Don't want to fill it up now? <button onClick={handleSkip} className="font-medium transition-all duration-100 hover:font-bold">Skip</button></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 md:hidden">
                <div className="w-full max-w-sm">
                    {/* Progress Bar for Mobile */}
                    <ProgressBar currentStep={1} totalSteps={5} />
                    
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-plum">Welcome! Let's start with your info.</h1>
                    </div>
                    
                    <div className="space-y-4">
                        <Input 
                            hint="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        
                        <div>
                            <label className="block px-2 mb-2 text-lg text-black/50 font-inter">Date of Birth</label>
                            <div className="flex space-x-2">
                                <Input 
                                    hint="DD" 
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    type="number"
                                />
                                <Input 
                                    hint="MM" 
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    type="number"
                                />
                                <Input 
                                    hint="YYYY" 
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    type="number"
                                />
                            </div>
                        </div>
                        
                        <GenderSlider 
                            selectedGender={selectedGender}
                            onGenderChange={setSelectedGender}
                        />
                        
                        <Dropdown 
                            hint="Gender Identity"
                            options={genderIdentityOptions}
                            value={genderIdentity}
                            onChange={setGenderIdentity}
                        />
                        
                        <div className="pt-2">
                            <Button text="CONTINUE" onClick={handleContinue}/>
                        </div>
                        <div className="text-center">
                            <p className="text-sm">Don't want to fill it up now? <button onClick={handleSkip} className="font-medium transition-all duration-100 hover:font-bold">Skip</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalInfo;