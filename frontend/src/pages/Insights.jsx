import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ThumbsUp, ThumbsDown, TrendingUp, Calendar, Brain, Target, BookOpen, Coffee, Music, Heart, Clock, Lightbulb } from 'lucide-react';
import RecommendationModal from '../components/RecommendationModal';

// Weekly mood patterns with more detailed data
const weeklyMoodData = [
  { day: 'Mon', mood: 3, energy: 2.5, stress: 3, activities: ['Work', 'Exercise'] },
  { day: 'Tue', mood: 2, energy: 2, stress: 4, activities: ['Work', 'Meeting'] },
  { day: 'Wed', mood: 1, energy: 1.5, stress: 4.5, activities: ['Work', 'Deadline'] },
  { day: 'Thu', mood: 1, energy: 1, stress: 4, activities: ['Work', 'Late night'] },
  { day: 'Fri', mood: 2, energy: 2.5, stress: 3, activities: ['Work', 'Social'] },
  { day: 'Sat', mood: 4, energy: 4, stress: 1, activities: ['Rest', 'Friends'] },
  { day: 'Sun', mood: 3, energy: 3.5, stress: 2, activities: ['Rest', 'Family'] }
];

// Historical mood trends (last 4 weeks)
const monthlyTrendData = [
  { week: 'Week 1', avgMood: 2.8, consistency: 85 },
  { week: 'Week 2', avgMood: 2.5, consistency: 75 },
  { week: 'Week 3', avgMood: 2.2, consistency: 70 },
  { week: 'Week 4', avgMood: 2.4, consistency: 78 }
];

const weeklyRecommendations = [
  {
    id: 1,
    title: 'Wednesday Wind-Down',
    description: 'Schedule a relaxing activity every Wednesday evening to combat midweek stress peaks.',
    icon: <Clock className="w-5 h-5" />,
    category: 'Routine',
    type: 'Strategy',
    difficulty: 'Medium',
    impact: 'High',
    rating: null,
    basedOn: 'Midweek stress patterns'
  },
  {
    id: 2,
    title: 'Social Connection',
    description: 'Plan meaningful social interactions on Tuesday to prevent mood dips.',
    icon: <Coffee className="w-5 h-5" />,
    category: 'Social',
    type: 'Activity',
    difficulty: 'Easy',
    impact: 'Medium',
    rating: null,
    basedOn: 'Social correlation analysis'
  },
  {
    id: 3,
    title: 'Weekly Goal Setting',
    description: 'Set achievable weekly goals every Sunday to maintain motivation throughout the week.',
    icon: <Target className="w-5 h-5" />,
    category: 'Planning',
    type: 'Strategy',
    difficulty: 'Medium',
    impact: 'High',
    rating: null,
    basedOn: 'Weekend peak optimization'
  },
  {
    id: 4,
    title: 'Stress-Relief Playlist',
    description: 'Create and use a calming playlist during your identified high-stress periods.',
    icon: <Music className="w-6 h-6" />,
    category: 'Wellness',
    type: 'Resource',
    difficulty: 'Easy',
    impact: 'Medium',
    rating: null,
    basedOn: 'Stress level correlation'
  }
];

const moodPatternInsights = [
  {
    title: 'Midweek Challenge',
    description: 'Your mood consistently drops on Tuesday and Wednesday, with stress levels peaking during this time.',
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    icon: <TrendingUp className="w-4 h-4 text-red-600" />,
    actionable: true
  },
  {
    title: 'Weekend Recovery',
    description: 'You show strong resilience with mood improvements every weekend, particularly on Saturdays.',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    icon: <Heart className="w-4 h-4 text-green-600" />,
    actionable: false
  },
  {
    title: 'Energy-Mood Connection',
    description: 'Your energy levels directly correlate with mood (87% correlation), especially on weekdays.',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    icon: <Brain className="w-4 h-4 text-blue-600" />,
    actionable: true
  }
];

const Insights = ({ userId }) => {
  const [recommendations, setRecommendations] = useState(weeklyRecommendations);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rateRecommendation = (recommendationId, rating) => {
    setRecommendations(prev => 
      prev.map(recommendation => 
        recommendation.id === recommendationId 
          ? { ...recommendation, rating }
          : recommendation
      )
    );
  };

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  const moodFormatter = (value) => {
    const moodMap = {
      1: '🙁 Negative',
      2: '😐 Neutral',
      3: '🙂 Positive',
      4: '😊 Very Positive'
    };
    return moodMap[value] || value;
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="p-5 lg:px-10 lg:py-5">
        <h1 className="text-2xl font-bold">🔍 Insights</h1>
        <p className="text-md text-black/50">Discover weekly patterns and get data-driven recommendations for your mental wellness journey.</p>
      </div>

      <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
        
        {/* Weekly Mood & Energy Analysis */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-plum-100">
              <Calendar className="w-5 h-5 text-plum-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Mood & Energy Patterns</h2>
              <p className="text-sm text-gray-600">Track correlations between mood, energy, and stress levels</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4]}
                tickFormatter={moodFormatter}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'mood') return [moodFormatter(value), 'Mood'];
                  if (name === 'energy') return [value.toFixed(1), 'Energy Level'];
                  if (name === 'stress') return [value.toFixed(1), 'Stress Level'];
                  return [value, name];
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                name="mood"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="energy"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="stress"
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-purple-800">Mood</span>
              </div>
              <p className="text-xs text-purple-700">Average: 2.3/4</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Energy</span>
              </div>
              <p className="text-xs text-green-700">Average: 2.4/4</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Stress</span>
              </div>
              <p className="text-xs text-yellow-700">Average: 3.1/5</p>
            </div>
          </div>
        </div>

        {/* Pattern Insights */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-lilac-100">
              <Brain className="w-5 h-5 text-lilac-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Key Patterns</h2>
              <p className="text-sm text-gray-600">AI-detected insights</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {moodPatternInsights.map((insight, index) => (
              <div key={index} className={`p-3 border rounded-lg ${insight.color}`}>
                <div className="flex items-start gap-2">
                  {insight.icon}
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${insight.textColor}`}>{insight.title}</h3>
                    <p className={`text-xs mt-1 ${insight.textColor}`}>{insight.description}</p>
                    {insight.actionable && (
                      <div className="flex items-center gap-1 mt-2">
                        <Lightbulb className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-700">Actionable insight</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Analysis */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Monthly Trends</h2>
              <p className="text-sm text-gray-600">Track your progress over the past 4 weeks</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgMood" fill="#8b5cf6" name="Average Mood" />
              <Bar dataKey="consistency" fill="#c084fc" name="Consistency %" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <h3 className="mb-1 text-sm font-semibold text-blue-800">Trend Direction</h3>
              <p className="text-xs text-blue-700">
                Slight downward trend in mood over the past month. Week 4 shows improvement.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <h3 className="mb-1 text-sm font-semibold text-purple-800">Consistency Score</h3>
              <p className="text-xs text-purple-700">
                Your mood tracking consistency improved to 78% this week. Great progress!
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Recommendations */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Strategies</h2>
              <p className="text-sm text-gray-600">Based on your patterns</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div 
                key={recommendation.id} 
                className="p-3 transition-all border border-gray-200 rounded-lg cursor-pointer hover:border-plum-300 hover:shadow-md"
                onClick={() => handleRecommendationClick(recommendation)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-plum-100">
                    {recommendation.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">{recommendation.title}</h3>
                    <p className="mb-2 text-xs text-gray-600">{recommendation.description}</p>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">
                        {recommendation.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getImpactColor(recommendation.impact)}`}>
                        {recommendation.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs italic text-gray-500">Based on: {recommendation.basedOn}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">Click for detailed guide</span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rateRecommendation(recommendation.id, 'up');
                      }}
                      className={`p-1 rounded transition-colors ${
                        recommendation.rating === 'up' 
                          ? 'bg-green-100 text-green-600' 
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rateRecommendation(recommendation.id, 'down');
                      }}
                      className={`p-1 rounded transition-colors ${
                        recommendation.rating === 'down' 
                          ? 'bg-red-100 text-red-600' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Content */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-3 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-100">
              <BookOpen className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Curated Content for Your Journey</h2>
              <p className="text-sm text-gray-600">Resources tailored to your specific patterns and challenges</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <iframe
                className="w-full h-48 rounded-lg"
                src="https://www.youtube.com/embed/inpok4MKVLM"
                title="Midweek Stress Relief"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="p-3 rounded-lg bg-red-50">
                <h3 className="text-sm font-semibold text-red-800">Midweek Stress Relief</h3>
                <p className="mt-1 text-xs text-red-700">
                  Specifically chosen for your Tuesday-Wednesday stress pattern. Practice during lunch breaks for best results.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <iframe
                className="w-full h-48 rounded-lg"
                src="https://www.youtube.com/embed/ZToicYcHIOU"
                title="Weekend Energy Boost"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="p-3 rounded-lg bg-green-50">
                <h3 className="text-sm font-semibold text-green-800">Weekend Energy Amplifier</h3>
                <p className="mt-1 text-xs text-green-700">
                  Leverage your natural weekend positivity with this energy-boosting routine. Perfect for Saturday mornings.
                </p>
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
};

export default Insights;