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
  const [loadingAiInsights, setLoadingAiInsights] = useState(true);
  const [loadingJournalEntries, setLoadingJournalEntries] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -- For displaying the weekly summary --
  const [weeklySummary, setWeeklySummary] = useState(null);

  // Helper to convert string mood rating (from get-journal-entries) to a numeric value (1-5)
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

  // --- Fetch AI Insights (for patterns and weekly summary) ---
  useEffect(() => {
  const fetchAiInsights = async () => {
    setLoadingAiInsights(true);
    try {
      const res = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // API returns a single object, not an array!
      setAiInsights(data); // keep it as object!
      setWeeklySummary(data.weekly_summary || null);
    } catch (err) {
      setAiInsights(null);
      setWeeklySummary(null);
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


  // --- Fetch Journal Entries ---
  useEffect(() => {
    const fetchJournalEntries = async () => {
      setLoadingJournalEntries(true);
      try {
        const res = await fetch(`http://localhost:3000/api/get-journal-entries?userId=${userId}&limit=30`);
        if (!res.ok) {
          setJournalEntries([]);
          return;
        }
        const data = await res.json();
        if (!data.success || !Array.isArray(data.entries)) {
          setJournalEntries([]);
          return;
        }
        setJournalEntries(data.entries);
      } catch (err) {
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

  // --- Fetch Recommendations ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/recommendations?userId=${userId}`);
        if (!res.ok) {
          setRecommendations([]);
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          setRecommendations([]);
          return;
        }
        setRecommendations(data);
      } catch (err) {
        setRecommendations([]);
      }
    };
    if (userId) fetchRecommendations();
  }, [userId]);

  // Mood formatter for the Y-Axis and Tooltip, consistent with 1-5 numeric scale
  const moodFormatter = (value) => {
    const map = {
      1: '😢 Very Sad',
      2: '😕 Sad',
      3: '😐 Neutral',
      4: '😊 Happy',
      5: '😄 Very Happy'
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

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  // Memoized data for the Weekly Mood Chart
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

  // Monthly Trend Data (optional: hardcoded)
  const monthlyTrendData = useMemo(() => {
    return [
      { week: 'Week 1', avgMood: 3.5, consistency: 70 },
      { week: 'Week 2', avgMood: 3.8, consistency: 85 },
      { week: 'Week 3', avgMood: 3.2, consistency: 60 },
      { week: 'Week 4', avgMood: 4.1, consistency: 90 },
    ];
  }, []);

  // Mood Pattern Insights (uses `aiInsights`)
  const insight = aiInsights || {};
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

  if (loadingAiInsights || loadingJournalEntries) {
    return <div className="p-10 text-center">Loading insights...</div>;
  }

  if (aiInsights.length === 0 && journalEntries.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        <p>No insights or journal entries available yet.</p>
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
              <h2 className="text-lg font-semibold text-gray-800 md:text-xl">Weekly Mood Patterns</h2>
              <p className="text-sm text-gray-600">Track your mood levels over time</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={moodFormatter} />
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
              {/* These lines are kept for future extensibility */}
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
                  <Lightbulb className={`w-4 h-4 ${item.textColor}`} />
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

      {/* --- Weekly Summary Card at the bottom --- */}
      <div className="max-w-4xl mx-auto mt-8 mb-10">
        <div className="p-6 rounded-xl shadow bg-blue-50 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Weekly Mood Summary
          </h2>
          <p className="text-sm text-blue-700">
            {weeklySummary
              ? (typeof weeklySummary === "string"
                  ? weeklySummary
                  : weeklySummary.summary || JSON.stringify(weeklySummary))
              : "No weekly summary available yet."}
          </p>
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
