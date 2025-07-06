import * as React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ThumbsUp, ThumbsDown, Heart, Clock, BookOpen,
  Coffee, Music, Target
} from 'lucide-react';

const moodLabelMap = {
  'Very Negative': 1,
  'Negative': 2,
  'Neutral': 3,
  'Positive': 4,
  'Very Positive': 5
};

const Insights = ({ userId }) => {
  const [weeklyMoodData, setWeeklyMoodData] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [aiInsight, setAiInsight] = React.useState('');
  const [aiExplanation, setAiExplanation] = React.useState('');
  const [aiPatterns, setAiPatterns] = React.useState('');

  React.useEffect(() => {
    const fetchMoodData = async () => {
      const res = await fetch(`/api/get-journal-entries?userId=${userId}`);
      const json = await res.json();

      if (json.success) {
        const dailyData = json.entries.map(entry => ({
          day: new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
          mood: moodLabelMap[entry.sentiment_label] || 3
        }));

        setWeeklyMoodData(dailyData);
      }
    };

    const fetchAIInsights = async () => {
      const res = await fetch(`/api/get-ai-insights?userId=${userId}`);
      const json = await res.json();

      if (json.success && json.insights.length > 0) {
        const latest = json.insights[0];

        setAiInsight(latest.insight);
        setAiExplanation(latest.explanation);
        setAiPatterns(latest.patterns);

        const suggestionsFormatted = (latest.suggestions || []).map((text, index) => ({
          id: index + 1,
          title: `Suggestion ${index + 1}`,
          description: text,
          icon: <Heart className="w-5 h-5" />,
          category: 'AI Tip',
          rating: null
        }));

        setSuggestions(suggestionsFormatted);
      }
    };

    if (userId) {
      fetchMoodData();
      fetchAIInsights();
    }
  }, [userId]);

  const rateSuggestion = (suggestionId, rating) => {
    setSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === suggestionId
          ? { ...suggestion, rating }
          : suggestion
      )
    );
  };

  const moodFormatter = (value) => {
    const reverseMoodMap = {
      1: '🙁 Very Negative',
      2: '😕 Negative',
      3: '😐 Neutral',
      4: '🙂 Positive',
      5: '😄 Very Positive'
    };
    return reverseMoodMap[value] || value;
  };

  const personalizedRecommendations = [
    {
      id: 1,
      title: 'Gratitude Journaling',
      description: 'Based on your positive weekend moods, try writing down 3 things you\'re grateful for each morning.',
      icon: <BookOpen className="w-6 h-6" />,
      type: 'Activity',
      difficulty: 'Easy'
    },
    {
      id: 2,
      title: 'Stress-Relief Playlist',
      description: 'Create a calming playlist for your challenging midweek days.',
      icon: <Music className="w-6 h-6" />,
      type: 'Resource',
      difficulty: 'Easy'
    },
    {
      id: 3,
      title: 'Weekly Goal Setting',
      description: 'Set small, achievable goals each Monday to maintain motivation throughout the week.',
      icon: <Target className="w-6 h-6" />,
      type: 'Strategy',
      difficulty: 'Medium'
    }
  ];

  return (
    <div className="w-full">
      <div className="p-5 lg:px-10 lg:py-5">
        <h1 className="text-2xl font-bold">🔍 Insights</h1>
        <p className="text-md text-black/50">
          Discover patterns and get personalized recommendations for your mental wellness journey.
        </p>
      </div>

      <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
        {/* Mood Pattern This Week */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">🏃 Mood Pattern This Week</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyMoodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={moodFormatter}
              />
              <Tooltip formatter={(value) => [moodFormatter(value), 'Mood']} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Key Insights:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• {aiInsight}</p>
              <p>• {aiPatterns}</p>
              <p>• {aiExplanation}</p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">💡 Suggestions</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">{suggestion.title}</h3>
                    <p className="mb-2 text-xs text-gray-600">{suggestion.description}</p>
                    <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded">
                      {suggestion.category}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => rateSuggestion(suggestion.id, 'up')}
                    className={`p-1 rounded transition-colors ${
                      suggestion.rating === 'up'
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rateSuggestion(suggestion.id, 'down')}
                    className={`p-1 rounded transition-colors ${
                      suggestion.rating === 'down'
                        ? 'bg-red-100 text-red-600'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">🎬 Recommended for You</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <iframe
                className="w-full h-48 rounded-lg"
                src="https://www.youtube.com/embed/inpok4MKVLM"
                title="Stress Relief Meditation"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">5-Minute Stress Relief</h3>
                <p className="text-xs text-gray-600">Perfect for your midweek challenges</p>
              </div>
            </div>
            <div className="space-y-4">
              <iframe
                className="w-full h-48 rounded-lg"
                src="https://www.youtube.com/embed/ZToicYcHIOU"
                title="Weekend Gratitude Practice"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Gratitude Practice</h3>
                <p className="text-xs text-gray-600">Enhance your positive weekend vibes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Just for You */}
        <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">⭐ Just for You</h2>
          <div className="space-y-4">
            {personalizedRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="p-3 transition-colors border border-gray-200 rounded-lg hover:border-purple-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">{recommendation.icon}</div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-gray-800">{recommendation.title}</h3>
                    <p className="mb-2 text-xs text-gray-600">{recommendation.description}</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded">
                        {recommendation.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          recommendation.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-700'
                            : recommendation.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {recommendation.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 mt-4 rounded-lg bg-blue-50">
            <p className="text-xs text-blue-700">
              💡 These recommendations are based on your mood patterns and journal entries. Try one today!
            </p>
          </div>
        </div>

        {/* Weekly Wellness Summary */}
        <div className="col-span-1 p-4 bg-white shadow lg:col-span-3 md:p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">📊 Weekly Wellness Summary</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-blue-50">
              <h3 className="mb-2 text-sm font-semibold text-blue-800">Mood Insights</h3>
              <p className="text-xs text-blue-700">
                {aiInsight}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <h3 className="mb-2 text-sm font-semibold text-green-800">Strengths</h3>
              <p className="text-xs text-green-700">
                You consistently bounce back from difficult days and maintain positive weekend moods.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <h3 className="mb-2 text-sm font-semibold text-purple-800">Focus Areas</h3>
              <p className="text-xs text-purple-700">
                Consider implementing stress-management techniques for Tuesday and Wednesday.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
