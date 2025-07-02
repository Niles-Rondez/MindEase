import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const dummyMoodData = [
  { day: "Mon", mood: 3 },
  { day: "Tue", mood: 2 },
  { day: "Wed", mood: 1 },
  { day: "Thu", mood: 1 },
  { day: "Fri", mood: 1 },
  { day: "Sat", mood: 1 },
  { day: "Sun", mood: 2 },
];

const moodMap = {
  1: "Negative",
  2: "Neutral",
  3: "Positive",
};

//Get Frequent Mood
const moodValues = dummyMoodData.map((entry) => entry.mood);

const moodFreq = {};
moodValues.forEach((mood) => {
  moodFreq[mood] = (moodFreq[mood] || 0) + 1;
});

const mostCommonMood = Object.entries(moodFreq).reduce((a, b) =>
  a[1] > b[1] ? a : b
)[0];

export default function Dashboard({ userId }) {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar userId={userId}/>
      <div className="flex flex-col items-center w-full min-h-screen">
        <div className="w-full mx-auto max-w-7xl">
          <div className="p-5 lg:px-10 lg:py-5">
            <h1 className="text-2xl font-bold">👋 Welcome back, User</h1>
            <p className="px-10 text-md text-black/50">Here's a snapshot of your mental wellness this week.</p>
          </div>

          <div className="grid gap-4 p-4 md:gap-6 lg:grid-cols-3 auto-rows-min">
            {/* Weekly Mood Chart */}
            <div className="col-span-1 p-4 bg-white shadow lg:col-span-2 md:p-6 rounded-xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                Weekly Mood Trend
              </h2>
              <ResponsiveContainer width="100%" height={390}>
                <LineChart data={dummyMoodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis
                    domain={[0, 6]}
                    ticks={[1, 3, 5]}
                    tickFormatter={(tick) => {
                      const moodMap = {
                        1: "🙁 Negative",
                        3: "😐 Neutral",
                        5: "🙂 Positive",
                      };
                      return moodMap[tick] || tick;
                    }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const moodMap = {
                        1: "🙁 Negative",
                        3: "😐 Neutral",
                        5: "🙂 Positive",
                      };
                      return moodMap[value] || value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Summary and Mood Trend Cards */}
            <div className="flex flex-col h-full md:mx-10 gap-y-4 md:gap-y-10">
              <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                  Weekly Mood Summary
                </h2>
                <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                  This week, your mood showed a noticeable fluctuation. You
                  started the week feeling relatively neutral on Monday and
                  experienced a dip in mood on Tuesday and Thursday, suggesting
                  possible stress or challenges midweek.
                </p>
              </div>
              <div className="col-span-1 p-4 bg-white shadow md:p-6 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                  Mood Trend Analysis
                </h2>
                <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                  Your mood improved by the weekend, peaking on Sunday with a very
                  positive emotional state. Maintaining this upward trend by
                  engaging in relaxing or enjoyable activities could help
                  sustain a more balanced mood throughout the week.
                </p>
              </div>
            </div>
            
            {/* AI Insight */}
            <div className="flex flex-col lg:flex-row col-span-1 lg:col-span-3 p-4 md:p-6 bg-white shadow rounded-xl min-h-[300px] lg:min-h-[400px]">
              <div className="flex-1 mb-4 lg:pr-6 lg:mb-0">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                  AI Insight
                </h2>
                <p className="mb-4 text-xs text-gray-700 md:text-sm">
                  Based on your recent journal entries, you seem to have
                  fluctuating moods midweek. Consider scheduling relaxing
                  activities around Wednesday and Thursday.
                </p>
              </div>
              <div className="flex flex-col flex-1 h-full">
                <iframe
                  className="w-full rounded-lg flex-1 min-h-[200px] lg:min-h-[300px]"
                  src="https://www.youtube.com/embed/inpok4MKVLM"
                  title="Meditation Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <h1 className="mt-4 text-lg font-medium text-center md:text-2xl">Guided Meditation</h1>
              </div>
            </div>

            {/* Bottom Cards - Fixed Responsive Layout */}
            <div className="grid grid-cols-1 col-span-1 gap-4 lg:col-span-3 md:grid-cols-2 md:gap-6">
              <div className="p-4 bg-white shadow md:p-6 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                  Weekly Mood Summary
                </h2>
                <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                  This week, your mood showed a noticeable fluctuation. You
                  started the week feeling relatively neutral on Monday and
                  experienced a dip in mood on Tuesday and Thursday, suggesting
                  possible stress or challenges midweek.
                  This week, your mood showed a noticeable fluctuation. You
                  started the week feeling relatively neutral on Monday and
                  experienced a dip in mood on Tuesday and Thursday, suggesting
                  possible stress or challenges midweek.
                  This week, your mood showed a noticeable fluctuation. You
                  started the week feeling relatively neutral on Monday and
                  experienced a dip in mood on Tuesday and Thursday, suggesting
                  possible stress or challenges midweek.
                </p>
              </div>
              <div className="p-4 bg-white shadow md:p-6 rounded-xl">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
                  Mood Trend Analysis
                </h2>
                <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
                  Your mood improved by the weekend, peaking on Sunday with a very
                  positive emotional state. Maintaining this upward trend by
                  engaging in relaxing or enjoyable activities could help
                  sustain a more balanced mood throughout the week.
                  Your mood improved by the weekend, peaking on Sunday with a very
                  positive emotional state. Maintaining this upward trend by
                  engaging in relaxing or enjoyable activities could help
                  sustain a more balanced mood throughout the week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}