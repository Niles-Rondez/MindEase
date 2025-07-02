import React from 'react';

const moodOptions = [
    { value: 1, label: 'Very Sad', emoji: '😢', color: 'bg-red-500' },
    { value: 2, label: 'Sad', emoji: '🙁', color: 'bg-orange-500' },
    { value: 3, label: 'Neutral', emoji: '😐', color: 'bg-yellow-500' },
    { value: 4, label: 'Happy', emoji: '🙂', color: 'bg-green-500' },
    { value: 5, label: 'Very Happy', emoji: '😊', color: 'bg-blue-500' }
];

function MoodSlider({ mood, setMood }) {
    return (
        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
            {/* Current Mood Display */}
            <div className="mb-6 text-center">
                <div className="mb-2 text-4xl">
                    {moodOptions.find(option => option.value === mood)?.emoji}
                </div>
                <div className="text-lg font-medium text-gray-800">
                    {moodOptions.find(option => option.value === mood)?.label}
                </div>
            </div>

            {/* Mood Buttons */}
            <div className="flex justify-between gap-2 mb-4 cursor-pointer">
                {moodOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 flex-1 cursor-pointer ${
                            mood === option.value
                                ? 'bg-purple-100 border-2 border-lilac transform scale-105'
                                : 'bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    >
                        <div className="mb-1 text-2xl">{option.emoji}</div>
                        <div className={`text-xs font-medium ${
                            mood === option.value ? 'text-purple-700' : 'text-gray-600'
                        }`}>
                            {option.label}
                        </div>
                    </button>
                ))}
            </div>

            {/* Alternative Slider */}
            <div className="mt-6">
                <input
                    type="range"
                    min="1"
                    max="5"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, 
                            #ef4444 0%, 
                            #f97316 25%, 
                            #eab308 50%, 
                            #22c55e 75%, 
                            #3b82f6 100%)`
                    }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Very Sad</span>
                    <span>Sad</span>
                    <span>Neutral</span>
                    <span>Happy</span>
                    <span>Very Happy</span>
                </div>
            </div>
        </div>
    );
}

export default MoodSlider;