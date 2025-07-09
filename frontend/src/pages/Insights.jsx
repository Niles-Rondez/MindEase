"use client";
import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  ThumbsUp, ThumbsDown, TrendingUp, Calendar, Brain,
  Target, BookOpen, Coffee, Music, Heart, Clock, Lightbulb
} from 'lucide-react';
import RecommendationModal from '../components/RecommendationModal';

const Insights = ({ userId }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

 
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true); 
      try {
       
        const res = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load AI insights: HTTP", res.status, text);
          setInsights([]); 
          return;
        }

        
        const data = await res.json();
        console.log("Fetched AI Insights Data:", data); 

        if (!Array.isArray(data)) {
          console.error("AI Insights API returned non-array data:", data);
          setInsights([]);
          return;
        }
        setInsights(data); 

      } catch (err) {
        console.error("Error fetching AI insights:", err);
        setInsights([]); 
      } finally {
        setLoading(false); 
      }
    };

    if (userId) {
      fetchInsights();
    } else {
      setLoading(false); 
    }
  }, [userId]);

  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
       
        const res = await fetch(`http://localhost:3000/api/recommendations?userId=${userId}`);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load recommendations: HTTP", res.status, text);
          setRecommendations([]);
          return;
        }

        const data = await res.json();
        console.log("Fetched Recommendations Data:", data); 

        if (!Array.isArray(data)) {
          console.error("Recommendations API returned non-array data:", data);
          setRecommendations([]);
          return;
        }
        setRecommendations(data);

      } catch (err) {
        console.error("Error loading recommendations:", err);
        setRecommendations([]);
      }
    };

    if (userId) fetchRecommendations();
  }, [userId]);

  
  const insight = insights[0] || {};
  console.log("Current main insight object:", insight);

  const moodFormatter = (value) => {
    const map = {
      1: '🙁 Negative',
      2: '😐 Neutral',
      3: '🙂 Positive',
      4: '😊 Very Positive'
    };
    return map[value] || value;
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const rateRecommendation = (recommendationId, rating) => {
   
    console.log(`Rating recommendation ${recommendationId} as ${rating}`);
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === recommendationId ? { ...rec, rating } : rec
      )
    );
  };

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  const weeklyMoodData = useMemo(() => {
  const actualMoods = insight?.trend_analysis?.actual_mood || [];
  const predictedMoods = insight?.trend_analysis?.predicted_mood || [];

  // Collect unique dates from actual + predicted
  const allDates = [...new Set([
    ...actualMoods.map(a => a.date),
    ...predictedMoods.map(p => p.date)
  ])];

  return allDates.map(date => {
    const actual = actualMoods.find(a => a.date === date);
    const predicted = predictedMoods.find(p => p.date === date);
    return {
      date,
      mood: actual?.mood ?? null,
      energy: actual?.energy ?? null,
      stress: actual?.stress ?? null,
      predictedMood: predicted?.mood ?? null
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by actual date
}, [insight]);


  const monthlyTrendData = useMemo(() => {
    return [
      { week: 'Week 1', avgMood: 3.5, consistency: 70 },
      { week: 'Week 2', avgMood: 3.8, consistency: 85 },
      { week: 'Week 3', avgMood: 3.2, consistency: 60 },
      { week: 'Week 4', avgMood: 4.1, consistency: 90 },
    ];
  }, []);

  const moodPatternInsights = useMemo(() => {
    const patterns = [];

   
    if (Array.isArray(insight?.positive_patterns)) {
      insight.positive_patterns.forEach(pattern => {
        patterns.push({
          title: "Positive Pattern",
          description: pattern,
          color: 'bg-green-50',
          textColor: 'text-green-700'
        });
      });
    }

    
    if (Array.isArray(insight?.mood_triggers)) {
      insight.mood_triggers.forEach(trigger => {
        patterns.push({
          title: "Mood Trigger",
          description: trigger,
          color: 'bg-red-50',
          textColor: 'text-red-700'
        });
      });
    }

    
    if (Array.isArray(insight?.mood_improvement_tips)) {
      insight.mood_improvement_tips.forEach(tip => {
        patterns.push({
          title: "Improvement Tip",
          description: tip,
          color: 'bg-blue-50',
          textColor: 'text-blue-700'
        });
      });
    }

   
    if (Array.isArray(insight?.suggestions)) {
      insight.suggestions.forEach(suggestion => {
        patterns.push({
          title: "Suggestion",
          description: suggestion,
          color: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        });
      });
    }

  
    if (typeof insight?.insight === 'string' && !insight?.insight.startsWith('```json')) {
        patterns.push({
            title: "General Insight",
            description: insight.insight,
            color: 'bg-purple-50',
            textColor: 'text-purple-700'
        });
    }


    return patterns.length > 0 ? patterns : [
      {
        title: "No Patterns Detected Yet",
        description: "Journal more to help AI find patterns!",
        color: 'bg-gray-50',
        textColor: 'text-gray-700'
      }
    ];
  }, [insight]);


  if (loading) return <div className="p-10 text-center">Loading insights...</div>;

 
  if (insights.length === 0 && !loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        <p>No insights available yet.</p>
        <p>Please ensure you have journal entries and AI insights are being generated.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-5 lg:px-10 lg:py-5">
        <h1 className="text-2xl font-bold">🔍 Insights</h1>
        <p className="text-md text-black/50">Discover weekly patterns and get data-driven recommendations for your mental wellness journey.</p>
      </div>

      <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
        {/* Weekly Mood & Energy Chart */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-plum-100"><Calendar className="w-5 h-5 text-plum-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Mood & Energy Patterns</h2>
              <p className="text-sm text-gray-600">Track correlations between mood, energy, and stress levels</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4]} tickFormatter={moodFormatter} />
              <Tooltip formatter={(value, name) => {
                if (name === 'mood') return [moodFormatter(value), 'Mood'];
                if (name === 'energy') return [value !== null ? value.toFixed(1) : 'N/A', 'Energy'];
                if (name === 'stress') return [value !== null ? value.toFixed(1) : 'N/A', 'Stress'];
                return [value, name];
              }} />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} name="Mood" />
              {/* Only render energy/stress lines if data is expected to be present */}
              {weeklyMoodData.some(d => d.energy !== null) && (
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Energy" />
              )}
              {weeklyMoodData.some(d => d.stress !== null) && (
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Stress" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pattern Insights */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-lilac-100"><Brain className="w-5 h-5 text-lilac-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Key Patterns</h2>
              <p className="text-sm text-gray-600">AI-detected insights</p>
            </div>
          </div>

          <div className="space-y-3">
            {moodPatternInsights.map((item, index) => ( 
              <div key={index} className={`p-3 border rounded-lg ${item.color}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`w-4 h-4 ${item.textColor}`} /> {/* Icon color from text color */}
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${item.textColor}`}>{item.title}</h3>
                    <p className={`text-xs mt-1 ${item.textColor}`}>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
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
        </div>

        {/* Weekly Recommendations */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg"><Target className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Strategies</h2>
              <p className="text-sm text-gray-600">Based on your patterns</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 transition-all border border-gray-200 rounded-lg cursor-pointer hover:border-plum-300 hover:shadow-md"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-plum-100">
                    {/* You might want to map specific icons based on rec.type or rec.category */}
                    {rec.icon || <Clock className="w-5 h-5 text-plum-600" />} 
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">{rec.title}</h3>
                    <p className="mb-2 text-xs text-gray-600">{rec.description}</p>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getImpactColor(rec.impact)}`}>{rec.impact} Impact</span>
                    </div>
                    <p className="text-xs italic text-gray-500">Based on: {rec.basedOn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
      />
    </div>
  );
};

export default Insights;
