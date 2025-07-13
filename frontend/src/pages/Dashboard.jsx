"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import RecommendationModal from "../components/RecommendationModal";

const colorToNumericMood = (color) => {
  switch (color) {
    case 'Red': return 1;
    case 'Orange': return 2;
    case 'Yellow': return 3;
    case 'Green': return 4;
    case 'Blue': return 5;
    default: return null;
  }
};

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

export default function Dashboard({ userId }) {
  const [aiInsights, setAiInsights] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For Today's Insight and Prediction Accuracy cards
  const [todayInsightText, setTodayInsightText] = useState("Loading...");
  const [predictionAccuracy, setPredictionAccuracy] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    // Fetch only today_recommendations and prediction_accuracy for the cards
    const fetchTodayInsight = async () => {
      setInfoLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        // today_recommendations: expect an array, display the first description/title or a fallback
        let text = "No insight available today.";
        if (Array.isArray(data.today_recommendations) && data.today_recommendations.length > 0) {
          text = data.today_recommendations[0].description || data.today_recommendations[0].title || text;
        }
        setTodayInsightText(text);
        setPredictionAccuracy(data.prediction_accuracy);
      } catch {
        setTodayInsightText("No insight available today.");
        setPredictionAccuracy(null);
      } finally {
        setInfoLoading(false);
      }
    };
    if (userId) fetchTodayInsight();
  }, [userId]);

  // This effect loads mood data and all recs for Today’s Progress
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const insightsRes = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
        if (!insightsRes.ok) {
          setAiInsights([]);
        } else {
          const insightsData = await insightsRes.json();
          setAiInsights(Array.isArray(insightsData) ? insightsData : []);
          if (Array.isArray(insightsData) && insightsData.length > 0) {
            const todayInsight = insightsData[0];
            const recs = todayInsight?.today_recommendations;
            if (Array.isArray(recs)) {
              setRecommendations(
                recs.map((rec, index) => ({
                  ...rec,
                  id: index,
                  completed: false,
                }))
              );
            } else {
              setRecommendations([]);
            }
          } else {
            setRecommendations([]);
          }
        }

        const journalRes = await fetch(`http://localhost:3000/api/get-journal-entries?userId=${userId}&limit=30`);
        if (!journalRes.ok) {
          setJournalEntries([]);
        } else {
          const journalData = await journalRes.json();
          if (journalData.success && Array.isArray(journalData.entries)) {
            const sortedJournalEntries = journalData.entries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setJournalEntries(sortedJournalEntries);
          } else {
            setJournalEntries([]);
          }
        }

      } catch (err) {
        setAiInsights([]);
        setJournalEntries([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const moodData = useMemo(() => {
    const allDatesMap = {};

    journalEntries.forEach(entry => {
      const date = entry.date;
      const numericMood = colorToNumericMood(entry.mood_rating);
      if (numericMood !== null) {
        allDatesMap[date] = {
          date: date,
          actualMood: numericMood,
          predictedMood: null,
        };
      }
    });

    // Optional: Merge predictedMood data if needed (not changed here)

    return Object.values(allDatesMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [journalEntries]);

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  const toggleComplete = (id) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const completedCount = recommendations.filter((rec) => rec.completed).length;
  const totalCount = recommendations.length;

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Loading insights and journal data...</p>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center w-full min-h-screen">
        <div className="w-full mx-auto max-w-7xl">
          <div className="p-5 lg:px-10 lg:py-5">
            <h1 className="text-2xl font-bold">👋 Welcome back, User</h1>
            <p className="text-md text-black/50">
              Here's your daily wellness snapshot and personalized recommendations.
            </p>
          </div>

          <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
            {/* Today’s Progress */}
            <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-plum-100">
                  <Calendar className="w-5 h-5 text-plum-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
                    Today’s Progress
                  </h2>
                  <p className="text-sm text-gray-600">
                    {completedCount} of {totalCount} completed
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-plum-600 transition-all"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      rec.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-plum-300"
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
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                          <h3
                            className={`text-sm font-semibold ${
                              rec.completed
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {rec.title}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${
                              rec.completed ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {rec.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">
                              {rec.type}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded border ${getPriorityColor(
                                rec.priority
                              )}`}
                            >
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

            {/* Mood Tracking & Predictions */}
            <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-lilac-100">
                  <TrendingUp className="w-5 h-5 text-lilac-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
                    Mood Tracking & Predictions
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your actual mood vs AI predictions based on recommendations
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={moodFormatter}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      moodFormatter(value),
                      name === "actualMood" ? "Your Mood" : "AI Prediction",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualMood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                    name="actualMood"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedMood"
                    stroke="#c084fc"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#c084fc", strokeWidth: 2, r: 4 }}
                    name="predictedMood"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <h3 className="mb-1 text-sm font-semibold text-purple-800">
                    Today's Insight
                  </h3>
                  <p className="text-xs text-purple-700">
                    {infoLoading ? "Loading..." : todayInsightText}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">
                    Prediction Accuracy
                  </h3>
                  <p className="text-xs text-blue-700">
                    {infoLoading
                      ? "Loading..."
                      : predictionAccuracy !== null
                        ? `Our AI predictions are ${predictionAccuracy}% accurate when you follow recommendations.`
                        : "No accuracy data available."}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Wellness Companion */}
            <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
                    AI Wellness Companion
                  </h2>
                  <p className="text-sm text-gray-600">
                    Personalized content to support your daily wellness journey
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-plum-50 to-lilac-50">
                    <h3 className="mb-2 text-sm font-semibold text-plum-800">
                      Today's Affirmation
                    </h3>
                    <p className="text-sm text-plum-700">
                      {/* You may want to fetch this from aiInsights as well */}
                      You're doing your best, and that is enough.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="mb-2 text-sm font-semibold text-green-800">
                      Quick Tip
                    </h3>
                    <p className="text-sm text-green-700">
                      {/* You may want to fetch this from aiInsights as well */}
                      Try journaling your thoughts when feeling overwhelmed.
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
                    <h3 className="text-sm font-semibold text-gray-800">
                      5-Minute Morning Reset
                    </h3>
                    <p className="text-xs text-gray-600">
                      Perfect for starting your day with intention
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
}
