import ProgressBar from "../components/ProgressBar";
import HobbyGroup from "../components/HobbyGroup";
import React, { useState } from 'react';

const indoorHobbiesData = {
"Arts & Crafts": [
            { id: 1, name: "Drawing", icon: "🎨" },
            { id: 2, name: "Painting", icon: "🖌️" },
            { id: 3, name: "Calligraphy", icon: "🖋️" },
            { id: 4, name: "Origami", icon: "📜" },
            { id: 5, name: "Scrapbooking", icon: "📸" },
            { id: 6, name: "Knitting/Crocheting", icon: "🧶" },
            { id: 7, name: "Sewing", icon: "🪡" },
            { id: 8, name: "DIY Projects", icon: "🔨" }
        ],
        "Games & Entertainment": [
            { id: 9, name: "Board Games", icon: "🎲" },
            { id: 10, name: "Puzzle Solving", icon: "🧩" },
            { id: 11, name: "Card Games", icon: "🃏" },
            { id: 12, name: "Chess", icon: "♟️" },
            { id: 13, name: "Video Games", icon: "🎮" },
            { id: 14, name: "Dungeon & Dragons/Tabletop RPGs", icon: "🐉" }
        ],
        "Tech & Media": [
            { id: 15, name: "Photography", icon: "📷" },
            { id: 16, name: "Videography", icon: "📹" },
            { id: 17, name: "Vlogging/Streaming", icon: "📺" },
            { id: 18, name: "Podcasting", icon: "🎙️" },
            { id: 19, name: "Graphic Design", icon: "🎨" },
            { id: 20, name: "Animation/3D Modeling", icon: "💻" },
            { id: 21, name: "App/Website Development", icon: "👨‍💻" },
            { id: 22, name: "Coding / Programming", icon: "💻" }
        ],
        "Learning & Mental Enrichment": [
            { id: 23, name: "Reading", icon: "📚" },
            { id: 24, name: "Writing", icon: "✍️" },
            { id: 25, name: "Blogging", icon: "📝" },
            { id: 26, name: "Learning Languages", icon: "🌍" },
            { id: 27, name: "Studying history/philosophy/science", icon: "📖" },
            { id: 28, name: "Watching documentaries", icon: "🎥" }
        ],
        "Music & Performing Arts": [
            { id: 29, name: "Playing Musical Instruments", icon: "🎹" },
            { id: 30, name: "Singing", icon: "🎤" },
            { id: 31, name: "Dancing", icon: "💃" },
            { id: 32, name: "Music Production", icon: "🎵" },
            { id: 33, name: "Acting/ Voice Acting", icon: "🎭" }
        ],
        "Collecting/Investment": [
            { id: 34, name: "Cryptocurrency Trading", icon: "₿" },
            { id: 35, name: "Stock Market Investing", icon: "📈" },
            { id: 36, name: "Real Estate Watching", icon: "🏠" },
            { id: 37, name: "NFT Trading", icon: "🖼️" },
            { id: 38, name: "Stamp Collecting", icon: "📮" },
            { id: 39, name: "Coin Collecting", icon: "🪙" },
            { id: 40, name: "Action Figures Collecting", icon: "🤖" },
            { id: 41, name: "Trading Cards", icon: "🃏" },
            { id: 42, name: "Antiques Collecting", icon: "🏺" }
        ],
        "Cooking & Food": [
            { id: 43, name: "Cooking", icon: "👨‍🍳" },
            { id: 44, name: "Baking", icon: "🧁" },
            { id: 45, name: "Fermenting (kimchi, kombucha)", icon: "🥒" },
            { id: 46, name: "Mixology (making drinks)", icon: "🍹" }
        ],
        "Relaxation & Wellness": [
            { id: 47, name: "Meditation", icon: "🧘" },
            { id: 48, name: "Yoga", icon: "🧘‍♀️" },
            { id: 49, name: "Journaling", icon: "📔" },
            { id: 50, name: "Aromatherapy", icon: "🕯️" }
        ],
        "Animals & Pets": [
            { id: 51, name: "Dog Training", icon: "🐕" },
            { id: 52, name: "Pet Care (cats, reptiles, exotic)", icon: "🐱" },
            { id: 53, name: "Aquarium Keeping", icon: "🐠" }
        ],
        "Gardening & Home": [
            { id: 54, name: "Indoor Gardening", icon: "🪴" }
        ]
};

function IndoorHobbies(){
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleHobbyToggle = (hobbyId) => {
        setSelectedHobbies(prev => 
            prev.includes(hobbyId)
                ? prev.filter(id => id !== hobbyId)
                : [...prev, hobbyId]
        );
    };

    const handleContinue = () => {
        console.log('Selected hobbies:', selectedHobbies);
        // Handle navigation to next page
    };

    // Filter hobby groups based on search term
    const getFilteredHobbyGroups = () => {
        if (!searchTerm) return indoorHobbiesData;
        
        const filtered = {};
        Object.entries(indoorHobbiesData).forEach(([groupName, hobbies]) => {
            const filteredHobbies = hobbies.filter(hobby => 
                hobby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                groupName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredHobbies.length > 0) {
                filtered[groupName] = filteredHobbies;
            }
        });
        return filtered;
    };

    const filteredHobbyGroups = getFilteredHobbyGroups();

    return(
        <div className="min-h-screen font-sans md:bg-gray-50">
            {/* Desktop Layout */}
            <div className="hidden h-screen md:flex">                
                <div className="flex items-center justify-center flex-1 px-8">
                    <div className="w-full max-w-2xl">
                        {/* Progress Bar */}
                        <ProgressBar currentStep={2} totalSteps={5} />
                        
                        <div className="p-8 bg-white shadow-lg/20 rounded-2xl lg:p-10">
                            <h2 className="mb-6 text-2xl font-bold text-plum lg:text-3xl lg:mb-8">What are your indoor hobbies?</h2>
                            
                            {/* Search Input with Icon */}
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search hobbies..."
                                    className="w-full py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac"
                                />
                            </div>

                            {/* Hobby Groups */}
                            <div className="pr-2 space-y-1 overflow-y-auto max-h-80">
                                {Object.entries(filteredHobbyGroups).map(([groupName, hobbies]) => (
                                    <HobbyGroup
                                        key={groupName}
                                        title={groupName}
                                        hobbies={hobbies}
                                        selectedHobbies={selectedHobbies}
                                        onHobbyToggle={handleHobbyToggle}
                                    />
                                ))}
                                {Object.keys(filteredHobbyGroups).length === 0 && (
                                    <div className="py-8 text-center text-gray-500">
                                        No hobbies found matching "{searchTerm}"
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className='flex items-center justify-between pt-4 mt-6 border-t border-gray-100'>
                                <button className="px-6 py-3 text-lg font-medium text-gray-600 transition-all duration-200 rounded-xl hover:text-plum hover:bg-gray-100">
                                    Skip
                                </button>
                                <div className="flex items-center space-x-4">
                                    {selectedHobbies.length > 0 && (
                                        <span className="text-sm text-gray-600">
                                            {selectedHobbies.length} selected
                                        </span>
                                    )}
                                    <button 
                                        onClick={handleContinue}
                                        disabled={selectedHobbies.length === 0}
                                        className={`w-12 h-12 text-2xl font-bold text-white rounded-full transition-all duration-200 flex items-center justify-center ${
                                            selectedHobbies.length > 0 
                                                ? 'bg-lilac hover:bg-plum cursor-pointer' 
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {'>'}
                                    </button>
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
                    <ProgressBar currentStep={2} totalSteps={5} />
                    
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-plum">What are your indoor hobbies?</h1>
                    </div>
                    
                    {/* Search Input with Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search hobbies..."
                            className="w-full py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac"
                        />
                    </div>

                    {/* Hobby Groups */}
                    <div className="pr-2 space-y-1 overflow-y-auto max-h-120">
                        {Object.entries(filteredHobbyGroups).map(([groupName, hobbies]) => (
                            <HobbyGroup
                                key={groupName}
                                title={groupName}
                                hobbies={hobbies}
                                selectedHobbies={selectedHobbies}
                                onHobbyToggle={handleHobbyToggle}
                            />
                        ))}
                        {Object.keys(filteredHobbyGroups).length === 0 && (
                            <div className="py-8 text-center text-gray-500">
                                No hobbies found matching "{searchTerm}"
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className='flex items-center justify-between pt-4 mt-6 border-t border-gray-100'>
                        <button className="px-6 py-3 text-lg font-medium text-gray-600 transition-all duration-200 rounded-xl hover:text-plum hover:bg-gray-100">
                            Skip
                        </button>
                        <div className="flex items-center space-x-4">
                            {selectedHobbies.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {selectedHobbies.length} selected
                                </span>
                            )}
                            <button 
                                onClick={handleContinue}
                                disabled={selectedHobbies.length === 0}
                                className={`w-12 h-12 text-2xl font-medium text-white rounded-full transition-all duration-200 flex items-center justify-center ${
                                    selectedHobbies.length > 0 
                                        ? 'bg-lilac hover:bg-plum cursor-pointer' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {'>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IndoorHobbies;