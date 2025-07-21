"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  ThumbsUp, ThumbsDown, TrendingUp, Calendar, Brain,
  Target, BookOpen, Coffee, Music, Heart, Clock, Lightbulb, Zap, CheckCircle
} from 'lucide-react';
import RecommendationModal from '../components/RecommendationModal';

const Insights = ({ userId }) => {
  const [aiInsights, setAiInsights] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [loadingAiInsights, setLoadingAiInsights] = useState(true);
  const [loadingJournalEntries, setLoadingJournalEntries] = useState(true);
  const [loadingWeeklyTrends, setLoadingWeeklyTrends] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);


  const getNumericMood = (moodString) => {
    switch (moodString) {
      case 'Red': return 1;
      case 'Orange': return 2;
      case 'Yellow': return 3;
      case 'Green': return 4;
      case 'Blue': return 5;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

  const toggleComplete = (id) => {
  setRecommendations((prev) => {
    const updated = prev.map((rec) =>
      rec.id === id ? { ...rec, completed: !rec.completed } : rec
    );
    
    // Update counts
    const completed = updated.filter((rec) => rec.completed).length;
    setCompletedCount(completed);
    setTotalCount(updated.length);
    
    return updated;
  });
};

// Previous values for smoothing (initialize once)
let previousEnergy = null;
let previousStress = null;

// Random variance multipliers (changes how deep/shallow the smoothing is)
const getRandomSmoothingFactor = () => {
  return 0.3 + (Math.random() * 0.6); // Range: 0.3 to 0.9
};

const getRandomVarianceMultiplier = () => {
  return 0.5 + (Math.random() * 1.0); // Range: 0.5x to 1.5x variance
};

// Calculate energy based on mood (higher mood = higher energy)
const calculateEnergyFromMood = (mood) => {
  if (mood === null) return null;
  
  // Non-linear curve for more realistic relationship
  const moodNormalized = (mood - 1) / 4; // Convert 1-5 to 0-1
  const energyCurve = Math.pow(moodNormalized, 0.8); // Gentle curve
  
  // Random variance (sometimes deeper, sometimes higher)
  const varianceMultiplier = getRandomVarianceMultiplier();
  const baseVariance = (Math.random() * 0.8 - 0.4) * varianceMultiplier;
  const baseEnergy = energyCurve * 4.5 + 0.5 + baseVariance;
  const rawEnergy = Math.max(0.5, Math.min(5, baseEnergy));
  
  // Apply random smoothing (sometimes more, sometimes less)
  if (previousEnergy === null) {
    previousEnergy = rawEnergy;
    return rawEnergy;
  }
  
  const smoothingFactor = getRandomSmoothingFactor();
  const smoothedEnergy = (smoothingFactor * rawEnergy) + ((1 - smoothingFactor) * previousEnergy);
  previousEnergy = smoothedEnergy;
  
  return Math.max(0.5, Math.min(5, smoothedEnergy));
};

// Calculate stress based on mood (inverse relationship)
const calculateStressFromMood = (mood) => {
  if (mood === null) return null;
  
  // Non-linear inverse relationship with plateau effects
  const moodNormalized = (mood - 1) / 4; // Convert 1-5 to 0-1
  const inverseMood = 1 - moodNormalized;
  
  // Add realistic curve - stress doesn't increase linearly
  let stressCurve;
  if (inverseMood < 0.2) {
    stressCurve = inverseMood * 0.6; // Low stress stays low
  } else if (inverseMood > 0.8) {
    stressCurve = 0.8 + ((inverseMood - 0.8) * 0.5); // High stress plateaus
  } else {
    stressCurve = 0.2 * 0.6 + (inverseMood - 0.2) * 1.1; // Steeper in middle
  }
  
  // Random variance (sometimes deeper, sometimes higher)
  const varianceMultiplier = getRandomVarianceMultiplier();
  const baseVariance = (Math.random() * 0.9 - 0.45) * varianceMultiplier;
  const baseStress = stressCurve * 4 + 1 + baseVariance;
  const rawStress = Math.max(1, Math.min(5, baseStress));
  
  // Apply random smoothing
  if (previousStress === null) {
    previousStress = rawStress;
    return rawStress;
  }
  
  const smoothingFactor = getRandomSmoothingFactor();
  const smoothedStress = (smoothingFactor * rawStress) + ((1 - smoothingFactor) * previousStress);
  previousStress = smoothedStress;
  
  return Math.max(1, Math.min(5, smoothedStress));
};

  useEffect(() => {
    const fetchAiInsights = async () => {
      setLoadingAiInsights(true);
      try {
        const res = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load AI insights: HTTP", res.status, text);
          setAiInsights([]);
          return;
        }
        const data = await res.json();
        console.log("Fetched AI Insights Data:", data);
        if (!Array.isArray(data)) {
          console.error("AI Insights API returned non-array data:", data);
          setAiInsights([]);
          return;
        }
        setAiInsights(data);
        if (data.length > 0 && Array.isArray(data[0].today_recommendations)) {
        const recsWithState = data[0].today_recommendations.map((rec, idx) => ({
          ...rec,
          id: idx,
          completed: false,
        }));
        setRecommendations(recsWithState);
      } else {
        setRecommendations([]);
      }
      } catch (err) {
        console.error("Error fetching AI insights:", err);
        setAiInsights([]);
      } finally {
        setLoadingAiInsights(false);
      }
    };

    if (userId) {
      fetchAiInsights();
    } else {
      setLoadingAiInsights(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      setLoadingJournalEntries(true);
      try {
        const res = await fetch(`http://localhost:3000/api/get-journal-entries?userId=${userId}&limit=30`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load journal entries for graph: HTTP", res.status, text);
          setJournalEntries([]);
          return;
        }
        const data = await res.json();
        console.log("Fetched Journal Entries for Graph:", data);
        if (!data.success || !Array.isArray(data.entries)) {
          console.error("Journal Entries API returned unexpected data structure:", data);
          setJournalEntries([]);
          return;
        }
        setJournalEntries(data.entries);
      } catch (err) {
        console.error("Error fetching journal entries for graph:", err);
        setJournalEntries([]);
      } finally {
        setLoadingJournalEntries(false);
      }
    };

    if (userId) {
      fetchJournalEntries();
    } else {
      setLoadingJournalEntries(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchWeeklyTrends = async () => {
      setLoadingWeeklyTrends(true);
      try {
        const res = await fetch(`http://localhost:3000/api/weekly-trends?userId=${userId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load weekly trends: HTTP", res.status, text);
          setWeeklyTrends([]);
          return;
        }
        const data = await res.json();
        console.log("Fetched Weekly Trends Data:", data);
        if (!data.success || !Array.isArray(data.trends)) {
          console.error("Weekly Trends API returned unexpected data structure:", data);
          setWeeklyTrends([]);
          return;
        }
        setWeeklyTrends(data.trends);
      } catch (err) {
        console.error("Error fetching weekly trends:", err);
        setWeeklyTrends([]);
      } finally {
        setLoadingWeeklyTrends(false);
      }
    };

    if (userId) {
      fetchWeeklyTrends();
    } else {
      setLoadingWeeklyTrends(false);
    }
  }, [userId]);

  const insight = aiInsights[0] || {};
  console.log("Current main AI insight object:", insight);

  const moodFormatter = (value) => {
    const moodMap = {
      1: "🙁 Negative",
      2: "😐 Neutral", 
      3: "🙂 Positive",
      4: "😊 Very Positive",
      5: "😄 Excellent"
    };
    return moodMap[Math.round(value)] || value;
  };

  const formatXAxisLabel = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Set both dates to midnight to compare just the date part
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dateOnly - nowOnly; // Don't use Math.abs to preserve sign
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === 2) return '2 days later';
  if (diffDays > 2) return `${diffDays} days later`;
  if (diffDays === -2) return '2 days ago';
  if (diffDays < -2 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= -7 && diffDays >= -14) return '2 weeks ago';
  if (diffDays <= -14 && diffDays >= -21) return '3 weeks ago';
  
  // For weekly view, show day names for very old or future dates
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};;

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
    if (!journalEntries || journalEntries.length === 0) return [];

    // Get last 7 days of data
    const last7Days = journalEntries.slice(0, 7);
    
    return last7Days.map(entry => {
      const numericMood = getNumericMood(entry.mood_rating);
      const energy = calculateEnergyFromMood(numericMood);
      const stress = calculateStressFromMood(numericMood);
      
      return {
        day: formatXAxisLabel(entry.date),
        mood: numericMood,
        energy: energy ? parseFloat(energy.toFixed(1)) : null,
        stress: stress ? parseFloat(stress.toFixed(1)) : null,
        activities: ['Work', 'Personal'] // Placeholder activities
      };
    }).reverse(); // Show chronological order
  }, [journalEntries]);

  const monthlyTrendData = useMemo(() => {
    if (!weeklyTrends || weeklyTrends.length === 0) {
      return [];
    }
    return weeklyTrends.map(trend => ({
      week: trend.week,
      avgMood: trend.avgMood,
      consistency: trend.consistencyPercentage || 0
    }));
  }, [weeklyTrends]);

  const moodPatternInsights = useMemo(() => {
    const patterns = [];

    // Analyze mood patterns from data
    if (weeklyMoodData.length > 0) {
      const avgMood = weeklyMoodData.reduce((sum, day) => sum + (day.mood || 0), 0) / weeklyMoodData.length;
      const avgEnergy = weeklyMoodData.reduce((sum, day) => sum + (day.energy || 0), 0) / weeklyMoodData.length;
      const avgStress = weeklyMoodData.reduce((sum, day) => sum + (day.stress || 0), 0) / weeklyMoodData.length;

      // Find mood dips
      const moodDips = weeklyMoodData.filter(day => day.mood && day.mood < avgMood - 0.5);
      if (moodDips.length > 0) {
        patterns.push({
          title: 'Mood Dip Pattern',
          description: `Your mood tends to dip on ${moodDips.map(d => d.day).join(', ')}, with stress levels peaking during these times.`,
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: <TrendingUp className="w-4 h-4 text-red-600" />,
          actionable: true
        });
      }

      // Energy-mood correlation
      patterns.push({
        title: 'Energy-Mood Connection',
        description: `Your energy levels directly correlate with mood (${(avgEnergy / avgMood * 100).toFixed(0)}% correlation), especially on weekdays.`,
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
        icon: <Brain className="w-4 h-4 text-blue-600" />,
        actionable: true
      });

      // Recovery patterns
      const highMoodDays = weeklyMoodData.filter(day => day.mood && day.mood > avgMood + 0.5);
      if (highMoodDays.length > 0) {
        patterns.push({
          title: 'Recovery Strength',
          description: `You show strong resilience with mood improvements on ${highMoodDays.map(d => d.day).join(', ')}.`,
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          icon: <Heart className="w-4 h-4 text-green-600" />,
          actionable: false
        });
      }
    }

    // Add AI insights if available
    if (Array.isArray(insight?.positive_patterns)) {
      insight.positive_patterns.forEach(pattern => {
        patterns.push({
          title: "Positive Pattern",
          description: pattern,
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          icon: <Lightbulb className="w-4 h-4 text-green-600" />,
          actionable: false
        });
      });
    }

    if (Array.isArray(insight?.mood_triggers)) {
      insight.mood_triggers.forEach(trigger => {
        patterns.push({
          title: "Mood Trigger",
          description: trigger,
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          icon: <TrendingUp className="w-4 h-4 text-red-600" />,
          actionable: true
        });
      });
    }

    return patterns.length > 0 ? patterns : [
      {
        title: "No Patterns Detected Yet",
        description: "Journal more to help AI find patterns!",
        color: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-700',
        icon: <Lightbulb className="w-4 h-4 text-gray-600" />,
        actionable: false
      }
    ];
  }, [weeklyMoodData, insight]);

  // Calculate averages for display
  const weeklyAverages = useMemo(() => {
    if (weeklyMoodData.length === 0) return { mood: 0, energy: 0, stress: 0 };
    
    const validMoods = weeklyMoodData.filter(d => d.mood !== null);
    const validEnergies = weeklyMoodData.filter(d => d.energy !== null);
    const validStress = weeklyMoodData.filter(d => d.stress !== null);
    
    return {
      mood: validMoods.length > 0 ? (validMoods.reduce((sum, d) => sum + d.mood, 0) / validMoods.length) : 0,
      energy: validEnergies.length > 0 ? (validEnergies.reduce((sum, d) => sum + d.energy, 0) / validEnergies.length) : 0,
      stress: validStress.length > 0 ? (validStress.reduce((sum, d) => sum + d.stress, 0) / validStress.length) : 0
    };
  }, [weeklyMoodData]);

  if (loadingAiInsights || loadingJournalEntries || loadingWeeklyTrends) {
    return <div className="p-4 text-center sm:p-10">Loading insights...</div>;
  }

  if (journalEntries.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 sm:p-10">
        <p>No insights or journal entries available yet.</p>
        <p>Please ensure you have journal entries and AI insights are being generated.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 sm:p-5 lg:px-10 lg:py-5">
        <h1 className="text-xl font-bold sm:text-2xl">🔍 Insights</h1>
        <p className="text-sm text-black/50 sm:text-md">Discover weekly patterns and get data-driven recommendations for your mental wellness journey.</p>
      </div>

      <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
        
        {/* Weekly Mood & Energy Analysis */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-plum-100">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-plum-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Mood & Energy Patterns</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Track correlations between mood, energy, and stress levels</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0.5, 5.5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={moodFormatter}
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'mood') return [moodFormatter(value), 'Mood'];
                  if (name === 'energy') return [value?.toFixed(1) || 'N/A', 'Energy Level'];
                  if (name === 'stress') return [value?.toFixed(1) || 'N/A', 'Stress Level'];
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
                <span className="text-xs font-medium text-purple-800 sm:text-sm">Mood</span>
              </div>
              <p className="text-xs text-purple-700">Average: {weeklyAverages.mood.toFixed(1)}/5</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-xs font-medium text-green-800 sm:text-sm">Energy</span>
              </div>
              <p className="text-xs text-green-700">Average: {weeklyAverages.energy.toFixed(1)}/5</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span className="text-xs font-medium text-yellow-800 sm:text-sm">Stress</span>
              </div>
              <p className="text-xs text-yellow-700">Average: {weeklyAverages.stress.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
        
        {/* Pattern Insights */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-lilac-100">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-lilac-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Key Patterns</h2>
              <p className="text-xs text-gray-600 sm:text-sm">AI-detected insights</p>
            </div>
          </div>
          
          <div className="pr-2 space-y-3 overflow-y-auto h-120">
            {moodPatternInsights.map((pattern, index) => (
              <div key={index} className={`p-3 border rounded-lg ${pattern.color}`}>
                <div className="flex items-start gap-2">
                  {pattern.icon}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${pattern.textColor}`}>{pattern.title}</h3>
                    <p className={`text-xs mt-1 ${pattern.textColor} break-words`}>{pattern.description}</p>
                    {pattern.actionable && (
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
              <TrendingUp className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Monthly Trends</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Track your progress over recent weeks</p>
            </div>
          </div>
          
          {monthlyTrendData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'avgMood') return [value.toFixed(1), 'Average Mood'];
                    if (name === 'consistency') return [`${value.toFixed(1)}%`, 'Consistency'];
                    return [value, name];
                  }} />
                  <Bar dataKey="avgMood" fill="#8b5cf6" name="avgMood" />
                  <Bar dataKey="consistency" fill="#c084fc" name="consistency" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">Trend Direction</h3>
                  <p className="text-xs text-blue-700">
                    {monthlyTrendData.length > 1 && 
                     monthlyTrendData[monthlyTrendData.length - 1].avgMood > monthlyTrendData[monthlyTrendData.length - 2].avgMood
                     ? "Positive trend in recent weeks. Keep up the good work!"
                     : "Focus on consistency to improve your mood patterns."
                    }
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <h3 className="mb-1 text-sm font-semibold text-purple-800">Consistency Score</h3>
                  <p className="text-xs text-purple-700">
                    Your mood tracking consistency is {monthlyTrendData[monthlyTrendData.length - 1]?.consistency.toFixed(1)}% this week. 
                    {monthlyTrendData[monthlyTrendData.length - 1]?.consistency > 70 ? " Great progress!" : " Try to journal more regularly!"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p className="text-sm text-center">No monthly trends data available yet. Create more journal entries to see patterns!</p>
            </div>
          )}
        </div>

{/* Weekly Strategies (styled like “Today’s Progress”) */}
<div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 bg-orange-100 rounded-lg">
      <Zap className="w-5 h-5 text-orange-600" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
        Weekly Strategies
      </h2>
      <p className="text-sm text-gray-600">
        {completedCount} of {totalCount} completed
      </p>
    </div>
  </div>

  <div className="mb-4">
    <div className="w-full h-2 bg-gray-200 rounded-full">
      <div
        className="h-2 transition-all bg-orange-600 rounded-full"
        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
      />
    </div>
  </div>

  <div className="space-y-3">
    {recommendations.length > 0 ? (
      recommendations.map((rec) => (
        <div
          key={rec.id}
          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            rec.completed
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-gray-200 hover:border-orange-300'
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
                <h3 className={`text-sm font-semibold ${
                  rec.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}>
                  {rec.title}
                </h3>
                <p className={`text-xs mt-1 ${
                  rec.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {rec.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded">
                    {rec.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(rec.priority)}`}>
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
      ))
    ) : (
      <p className="text-center text-gray-500">No strategies available yet.</p>
    )}
  </div>
</div>


      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
      />
    </div>
    </div>
  );
};

export default Insights;