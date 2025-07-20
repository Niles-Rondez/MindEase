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

const formatDayLabel = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
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

const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dates = [];
  
  // Calculate dates for the past week (7 days including today)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

export default function Dashboard({ userId }) {
  const [aiInsights, setAiInsights] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const insightsRes = await fetch(`http://localhost:3000/api/ai-insights?userId=${userId}`);
        if (!insightsRes.ok) {
          const text = await insightsRes.text();
          console.error("AI Insights API response not OK:", insightsRes.status, text);
          setAiInsights([]);
        } else {
          const insightsData = await insightsRes.json();
          if (!Array.isArray(insightsData)) {
            console.error("Unexpected AI Insights API response format: Expected an array, but received:", insightsData);
            setAiInsights([]);
          } else {
            setAiInsights(insightsData);
            if (insightsData.length > 0) {
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
        }

        const journalRes = await fetch(`http://localhost:3000/api/get-journal-entries?userId=${userId}&limit=30`);
        if (!journalRes.ok) {
          const text = await journalRes.text();
          console.error("Journal Entries API response not OK:", journalRes.status, text);
          setJournalEntries([]);
        } else {
          const journalData = await journalRes.json();
          if (journalData.success && Array.isArray(journalData.entries)) {
            const sortedJournalEntries = journalData.entries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setJournalEntries(sortedJournalEntries);
          } else {
            console.error("Unexpected Journal Entries API response format:", journalData);
            setJournalEntries([]);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
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

  const todayInsight = aiInsights.length > 0 ? aiInsights[0] : null;

  const todaySummaryInsight = useMemo(() => {
    if (todayInsight && typeof todayInsight.insight === 'string') {
      try {
        let jsonString = todayInsight.insight
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const parsedInsight = JSON.parse(jsonString);

        if (parsedInsight.weekly_summary?.summary) {
          return parsedInsight.weekly_summary.summary;
        }
        if (parsedInsight.summary) {
          return parsedInsight.summary;
        }
        return "No detailed insight summary available.";
      } catch (e) {
        if (todayInsight.insight.includes('weekly_summary') ||
            todayInsight.insight.includes('summary')) {
          const summaryMatch = todayInsight.insight.match(/"summary":\s*"([^"]+)"/);
          if (summaryMatch && summaryMatch[1]) {
            return summaryMatch[1];
          }
        }
        console.warn("Failed to parse insight, showing raw content:", todayInsight.insight);
        return todayInsight.insight;
      }
    }
    return "No insight available today.";
  }, [todayInsight]);

  const moodData = useMemo(() => {
    const weekDates = getWeekDates();
    const allDatesMap = {};

    // Initialize all week dates
    weekDates.forEach(date => {
      allDatesMap[date] = {
        date: date,
        dayLabel: formatDayLabel(date),
        actualMood: null,
        predictedMood: null,
      };
    });

    // Add actual mood data for the week
    journalEntries.forEach(entry => {
      const date = entry.date;
      if (allDatesMap[date]) {
        const numericMood = colorToNumericMood(entry.mood_rating);
        if (numericMood !== null) {
          allDatesMap[date].actualMood = numericMood;
        }
      }
    });

    // Add predicted mood data for the week
    if (todayInsight && Array.isArray(todayInsight.predicted_mood)) {
      todayInsight.predicted_mood.forEach(entry => {
        const date = entry.date;
        if (allDatesMap[date]) {
          allDatesMap[date].predictedMood = entry.mood;
        }
      });
    }

    return Object.values(allDatesMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [journalEntries, todayInsight]);

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

  if (!todayInsight && !journalEntries.length && !loading) {
      return (
          <div className="p-8 text-center text-gray-500">
            <p>No daily insights or journal entries available for this user yet.</p>
            <p>Please ensure journal entries are present and insights are generated.</p>
          </div>
      );
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
            <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-plum-100">
                  <Calendar className="w-5 h-5 text-plum-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
                    Today's Progress
                  </h2>
                  <p className="text-sm text-gray-600">
                    {completedCount} of {totalCount} completed
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 transition-all rounded-full bg-plum-600"
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
                <LineChart 
                  data={moodData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dayLabel"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0.5, 5.5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={moodFormatter}
                    tick={{ fontSize: 12 }}
                    width={75}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      moodFormatter(value),
                      name === "actualMood" ? "Your Mood" : "AI Prediction",
                    ]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualMood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
                    connectNulls={true}
                    name="actualMood"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedMood"
                    stroke="#c084fc"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#c084fc", strokeWidth: 2, r: 4 }}
                    connectNulls={true}
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
                    {todaySummaryInsight}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <h3 className="mb-1 text-sm font-semibold text-blue-800">
                    Prediction Accuracy
                  </h3>
                  <p className="text-xs text-blue-700">
                    {todayInsight?.prediction_accuracy
                      ? `Our AI predictions are ${todayInsight.prediction_accuracy}% accurate when you follow recommendations.`
                      : "No accuracy data available."}
                  </p>
                </div>
              </div>
            </div>

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
                      {todayInsight?.today_affirmation ||
                        "You're doing your best, and that is enough."}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <h3 className="mb-2 text-sm font-semibold text-green-800">
                      Quick Tip
                    </h3>
                    <p className="text-sm text-green-700">
                      {todayInsight?.quick_tip ||
                        "Try journaling your thoughts when feeling overwhelmed."}
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