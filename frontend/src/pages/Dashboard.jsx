import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Target, Zap, CheckCircle, Clock } from "lucide-react";
import RecommendationModal from '../components/RecommendationModal';

const dualMoodData = [
  { day: "Mon", actualMood: 3, predictedMood: 3.2 },
  { day: "Tue", actualMood: 2, predictedMood: 2.8 },
  { day: "Wed", actualMood: 1, predictedMood: 2.5 },
  { day: "Thu", actualMood: 1, predictedMood: 2.2 },
  { day: "Fri", actualMood: 2, predictedMood: 3.0 },
  { day: "Sat", actualMood: 4, predictedMood: 3.8 },
  { day: "Sun", actualMood: 3, predictedMood: 3.5 },
];

// Today's specific recommendations
const todayRecommendations = [
  {
    id: 1,
    title: 'Morning Meditation',
    description: 'Start your day with 10 minutes of mindfulness to set a positive tone.',
    icon: <Zap className="w-5 h-5" />,
    type: 'Wellness',
    difficulty: 'Easy',
    timeEstimate: '10 min',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Midday Check-in',
    description: 'Take a moment to acknowledge your feelings and reset if needed.',
    icon: <Target className="w-5 h-5" />,
    type: 'Routine',
    difficulty: 'Easy',
    timeEstimate: '5 min',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: 'Evening Gratitude',
    description: 'Write down 3 things you\'re grateful for before bed.',
    icon: <CheckCircle className="w-5 h-5" />,
    type: 'Reflection',
    difficulty: 'Easy',
    timeEstimate: '5 min',
    priority: 'medium',
    completed: false
  }
];

const moodFormatter = (value) => {
  const moodMap = {
    1: "🙁 Negative",
    2: "😐 Neutral", 
    3: "🙂 Positive",
    4: "😊 Very Positive"
  };
  return moodMap[value] || value;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-50 text-red-700 border-red-200';
    case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function Dashboard({ userId }) {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState(todayRecommendations);

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  const toggleComplete = (id) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const completedCount = recommendations.filter(rec => rec.completed).length;
  const totalCount = recommendations.length;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center w-full min-h-screen">
        <div className="w-full mx-auto max-w-7xl">
          {/* Header */}
          <div className="p-5 lg:px-10 lg:py-5">
            <h1 className="text-2xl font-bold">👋 Welcome back, User</h1>
            <p className="text-md text-black/50">Here's your daily wellness snapshot and personalized recommendations.</p>
          </div>

          <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
            
            {/* Today's Progress - Top Priority */}
            <div className="col-span-1 p-4 bg-white shadow lg:col-span-1 md:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-plum-100">
                  <Calendar className="w-5 h-5 text-plum-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Today's Progress</h2>
                  <p className="text-sm text-gray-600">{completedCount} of {totalCount} completed</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 transition-all duration-300 rounded-full bg-plum-600"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Daily Recommendations */}
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      rec.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-plum-300'
                    }`}
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(rec.id);
                          }}
                          className={`mt-1 p-1 rounded-full transition-colors ${
                            rec.completed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                          <h3 className={`text-sm font-semibold ${rec.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {rec.title}
                          </h3>
                          <p className={`text-xs mt-1 ${rec.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {rec.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">
                              {rec.type}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {rec.timeEstimate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Tracking Chart */}
            <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-lilac-100">
                  <TrendingUp className="w-5 h-5 text-lilac-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Mood Tracking & Predictions</h2>
                  <p className="text-sm text-gray-600">Your actual mood vs AI predictions based on recommendations</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dualMoodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={moodFormatter}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      moodFormatter(value),
                      name === 'actualMood' ? 'Your Mood' : 'AI Prediction'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualMood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                    name="actualMood"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedMood"
                    stroke="#c084fc"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#c084fc', strokeWidth: 2, r: 4 }}
                    name="predictedMood"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <h3 className="mb-1 text-sm font-semibold text-purple-800">Today's Insight</h3>
                  <p className="text-xs text-purple-700">
                    Following your morning routine can boost your mood by 0.5 points on average.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">Prediction Accuracy</h3>
                  <p className="text-xs text-blue-700">
                    Our AI predictions are 78% accurate when you follow recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Wellness Companion */}
            <div className="col-span-1 p-4 bg-white shadow lg:col-span-3 md:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">AI Wellness Companion</h2>
                  <p className="text-sm text-gray-600">Personalized content to support your daily wellness journey</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-plum-50 to-lilac-50">
                    <h3 className="mb-2 text-sm font-semibold text-plum-800">Today's Affirmation</h3>
                    <p className="text-sm text-plum-700">
                      "I am capable of creating positive change in my life, one small step at a time. 
                      Today's challenges are opportunities for growth."
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="mb-2 text-sm font-semibold text-green-800">Quick Tip</h3>
                    <p className="text-sm text-green-700">
                      When feeling overwhelmed, try the 5-4-3-2-1 grounding technique: 
                      Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <iframe
                    className="w-full h-48 rounded-lg"
                    src="https://www.youtube.com/embed/inpok4MKVLM"
                    title="Daily Meditation"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-800">5-Minute Morning Reset</h3>
                    <p className="text-xs text-gray-600">Perfect for starting your day with intention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Modal */}
      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
      />
    </div>
  );
}