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
      try {
        const res = await fetch(`/api/ai-insights/route.ts?user_id=${userId}`);
        const data = await res.json();
        setInsights(data);
      } catch (err) {
        console.error("Failed to load AI insights:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchInsights();
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/api/recommendations?user_id=${userId}`);
        const data = await res.json();
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }
    };

    if (userId) fetchRecommendations();
  }, [userId]);

  const insight = insights[0] || {};

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
    return insight?.weekly_mood_energy_stress || [];
  }, [insight]);

  const monthlyTrendData = useMemo(() => {
    return insight?.monthly_trends || [];
  }, [insight]);

  const moodPatternInsights = insight?.pattern_insights || [];

  if (loading) return <div className="p-10 text-center">Loading insights...</div>;

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
              <XAxis dataKey="day" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4]} tickFormatter={moodFormatter} />
              <Tooltip formatter={(value, name) => {
                if (name === 'mood') return [moodFormatter(value), 'Mood'];
                if (name === 'energy') return [value.toFixed(1), 'Energy'];
                if (name === 'stress') return [value.toFixed(1), 'Stress'];
                return [value, name];
              }} />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
              <Line type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
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
            {moodPatternInsights.map((insight, index) => (
              <div key={index} className={`p-3 border rounded-lg ${insight.color || 'bg-gray-50'}`}>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${insight.textColor || 'text-gray-800'}`}>{insight.title}</h3>
                    <p className={`text-xs mt-1 ${insight.textColor || 'text-gray-700'}`}>{insight.description}</p>
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
                    {rec.icon || <Clock className="w-5 h-5" />}
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
