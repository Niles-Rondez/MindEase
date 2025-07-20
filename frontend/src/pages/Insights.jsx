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
  const [aiInsights, setAiInsights] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [loadingAiInsights, setLoadingAiInsights] = useState(true);
  const [loadingJournalEntries, setLoadingJournalEntries] = useState(true);
  const [loadingWeeklyTrends, setLoadingWeeklyTrends] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const insight = aiInsights[0] || {};
  console.log("Current main AI insight object:", insight);

const moodFormatter = (value) => {
  const moodMap = {
    1: "🙁 Very Sad",
    2: "😕 Sad",
    3: "😐 Neutral",
    4: "😊 Happy",
    5: "😄 Very Happy",
  };
  return moodMap[value] || value;
};

  const formatXAxisLabel = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 14) return '2 weeks ago';
    if (diffDays <= 21) return '3 weeks ago';
    
    // For older dates, show month and day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    if (!journalEntries || journalEntries.length === 0) return [];

    const dailyDataMap = new Map();
    journalEntries.forEach(entry => {
      const date = entry.date;
      const numericMood = getNumericMood(entry.mood_rating);

      if (!dailyDataMap.has(date)) {
        dailyDataMap.set(date, {
          date,
          totalMood: 0,
          moodCount: 0,
          energy: null,
          stress: null,
          predictedMood: null
        });
      }

      const dailyEntry = dailyDataMap.get(date);
      if (numericMood !== null) {
        dailyEntry.totalMood += numericMood;
        dailyEntry.moodCount += 1;
      }
    });

    const chartData = Array.from(dailyDataMap.values()).map(dailyEntry => ({
      date: dailyEntry.date,
      mood: dailyEntry.moodCount > 0 ? parseFloat((dailyEntry.totalMood / dailyEntry.moodCount).toFixed(1)) : null,
      energy: dailyEntry.energy,
      stress: dailyEntry.stress,
      predictedMood: dailyEntry.predictedMood
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return chartData;
  }, [journalEntries]);

  const weeklyTrendData = useMemo(() => {
    if (!weeklyTrends || weeklyTrends.length === 0) {
      return [];
    }
    return weeklyTrends.map(trend => ({
      week: trend.week,
      avgMood: trend.avgMood,
      totalEntries: trend.totalEntries,
      consistency: trend.consistencyPercentage || 0
    }));
  }, [weeklyTrends]);

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

  if (loadingAiInsights || loadingJournalEntries || loadingWeeklyTrends) {
    return <div className="p-4 text-center sm:p-10">Loading insights...</div>;
  }

  if (aiInsights.length === 0 && journalEntries.length === 0 && weeklyTrends.length === 0) {
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
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-plum-100"><Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-plum-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Mood Patterns</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Track your mood levels over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0.5, 5.5]} 
                ticks={[1, 2, 3, 4, 5]} 
                tickFormatter={moodFormatter}
                tick={{ fontSize: 12 }}
                width={75}
              />
              <Tooltip formatter={(value, name) => {
                if (name === 'mood') return [moodFormatter(value), 'Mood'];
                if (name === 'energy') return [value !== null ? value.toFixed(1) : 'N/A', 'Energy'];
                if (name === 'stress') return [value !== null ? value.toFixed(1) : 'N/A', 'Stress'];
                if (name === 'predictedMood') return [moodFormatter(value), 'AI Predicted Mood'];
                return [value, name];
              }} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                name="Mood"
              />
              {weeklyMoodData.some(d => d.energy !== null) && (
                <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Energy" />
              )}
              {weeklyMoodData.some(d => d.stress !== null) && (
                <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Stress" />
              )}
              {weeklyMoodData.some(d => d.predictedMood !== null) && (
                <Line
                  type="monotone"
                  dataKey="predictedMood"
                  stroke="#c084fc"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#c084fc', r: 4 }}
                  name="AI Predicted Mood"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-lilac-100"><Brain className="w-4 h-4 sm:w-5 sm:h-5 text-lilac-600" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Key Patterns</h2>
              <p className="text-xs text-gray-600 sm:text-sm">AI-detected insights</p>
            </div>
          </div>
          <div className="pr-2 space-y-3 overflow-y-auto h-80">
            {moodPatternInsights.map((item, index) => (
              <div key={index} className={`p-3 border-black/20 rounded-lg ${item.color}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.textColor}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${item.textColor}`}>{item.title}</h3>
                    <p className={`text-xs mt-1 ${item.textColor} break-words`}>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Trends</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Track your progress over the current month's weeks</p>
            </div>
          </div>
          {weeklyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => {
                  if (name === 'avgMood') return [value.toFixed(1), 'Average Mood'];
                  if (name === 'totalEntries') return [value, 'Total Entries'];
                  if (name === 'consistency') return [`${value.toFixed(1)}%`, 'Consistency'];
                  return [value, name];
                }} />
                <Bar dataKey="avgMood" fill="#8b5cf6" name="Average Mood" />
                <Bar dataKey="totalEntries" fill="#10b981" name="Total Entries" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p className="text-sm text-center">No weekly trends data available yet. Create more journal entries to see patterns!</p>
            </div>
          )}
        </div>

        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg"><Target className="w-4 h-4 text-yellow-600 sm:w-5 sm:h-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Strategies</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Based on your patterns</p>
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
                  <div className="flex-shrink-0 p-2 rounded-lg bg-plum-100">
                    {rec.icon || <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-plum-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800">{rec.title}</h3>
                    <p className="mb-2 text-xs text-gray-600">{rec.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getImpactColor(rec.impact)}`}>{rec.impact} Impact</span>
                    </div>
                    <p className="text-xs italic text-gray-500 break-words">Based on: {rec.basedOn}</p>
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