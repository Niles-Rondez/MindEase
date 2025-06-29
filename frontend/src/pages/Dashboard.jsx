import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const dummyMoodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 2 },
  { day: 'Wed', mood: 1 },
  { day: 'Thu', mood: 1 },
  { day: 'Fri', mood: 1 },
  { day: 'Sat', mood: 1 },
  { day: 'Sun', mood: 2 },
]

const moodMap = {
  1: 'Negative',
  2: 'Neutral',
  3: 'Positive'
}

//Get Frequent Mood
const moodValues = dummyMoodData.map(entry => entry.mood); 

const moodFreq = {}; 
moodValues.forEach(mood => {
  moodFreq[mood] = (moodFreq[mood] || 0) + 1; 
});

const mostCommonMood = Object.entries(moodFreq).reduce((a, b) => (a[1] > b[1] ? a : b))[0];


export default function Dashboard() {
  return (
    <div className="grid gap-6 p-4 lg:grid-cols-3">
      {/* Mood Summary */}
      <div className="p-6 bg-white rounded-xl shadow col-span-1 lg:col-span-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Mood Summary</h2>
        <ul className="text-gray-600 text-sm space-y-1">
          <p className="text-gray-700 text-sm">
          This week, your mood showed a noticeable fluctuation. You started the week 
          feeling relatively neutral on Monday and experienced a dip in mood on Tuesday 
          and Thursday, suggesting possible stress or challenges midweek. However, your mood 
          improved by the weekend, peaking on Sunday with a very positive emotional state. Maintaining this 
          upward trend by engaging in relaxing or enjoyable activities could help sustain a more balanced mood 
          throughout the week.
        </p>
        </ul>
      </div>

      {/* Weekly Mood Chart */}
      <div className="p-6 bg-white rounded-xl shadow col-span-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Mood Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dummyMoodData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis
            domain={[0, 6]}
            ticks={[1, 3, 5]}
            tickFormatter={(tick) => {
                const moodMap = {
                1: '🙁 Negative',
                3: '😐 Neutral',
                5: '🙂 Positive',
                }
                return moodMap[tick] || tick
            }}
            />
            <Tooltip
            formatter={(value) => {
                const moodMap = {
                1: '🙁 Negative',
                3: '😐 Neutral',
                5: '🙂 Positive',
                }
                return moodMap[value] || value
            }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
        The most frequently experienced mood was <strong>{moodMap[mostCommonMood]}</strong>.
      </p>
      </div>

      {/* AI Insight */}
      <div className="p-6 bg-white rounded-xl shadow col-span-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Insight</h2>
        <p className="text-gray-700 text-sm">
          Based on your recent journal entries, you seem to have fluctuating moods midweek. Consider scheduling relaxing activities around Wednesday and Thursday.
        </p>
      </div>

      {/* Meditation Videos */}
      <div className="p-6 bg-white rounded-xl shadow col-span-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Meditation Videos</h2>
        <div className="space-y-4">
          <iframe
            className="w-full rounded-lg"
            height="180"
            src="https://www.youtube.com/embed/inpok4MKVLM"
            title="Meditation Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  )
}
