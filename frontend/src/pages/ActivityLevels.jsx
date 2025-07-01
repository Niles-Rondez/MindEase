import React, { useState } from "react";
import ProgressBar from "../components/ProgressBar";
import runningMan from "../assets/running_man.png";

function ActivityLevels({userId, onContinue, onSkip }) {
  const [selectedLevel, setSelectedLevel] = useState(0);

  const activityLevels = [
    {
      level: 1,
      label: "Sedentary",
      description: "Little to no exercise",
      icon: "",
    },
    {
      level: 2,
      label: "Lightly Active",
      description: "Light exercise 1-3 days/week",
      icon: "",
    },
    {
      level: 3,
      label: "Moderately Active",
      description: "Moderate exercise 3-5 days/week",
      icon: "",
    },
    {
      level: 4,
      label: "Very Active",
      description: "Hard exercise 6-7 days/week",
      icon: "",
    },
    {
      level: 5,
      label: "Extremely Active",
      description: "Very hard exercise, physical job",
      icon: "",
    },
  ];

  const getGaugeColor = (level) => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
    return colors[level - 1] || "#d1d5db";
  };

  const getGaugeRotation = (level) => {
    if (level === 0) return 0;
    return ((level - 1) / 4) * 180;
  };

  const handleContinue = async () => {
  try {
    await fetch("http://localhost:3000/api/profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        activityLevel: selectedLevel,
        onboardingComplete: true  //mark onboarding as complete
      }),
    });

    onContinue(selectedLevel);  // continue to dashboard or main screen
  } catch (error) {
    console.error("Error submitting activity level:", error);
  }
};


  const handleSkip = () => {
    onSkip();
  };
  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Layout */}
      <div className="hidden h-screen md:flex">
        <div className="flex items-center justify-center flex-1 px-8">
          <div className="w-full max-w-3xl">
            {/* Progress Bar */}
            <div className="mb-8">
              <ProgressBar currentStep={5} totalSteps={5} />
            </div>

            <div className="p-12 bg-white border shadow-xl rounded-3xl lg:p-16 backdrop-blur-sm border-white/20">
              <h2 className="mb-6 text-4xl font-bold text-center text-plum lg:text-5xl">
                Rate your activity level!
              </h2>

              {/* Enhanced Circular Gauge */}
              <div className="flex flex-col items-center mb-16">
                <div className="relative h-40 mb-8 w-80">
                  {/* Gauge Background */}
                  <svg
                    className="w-full h-full drop-shadow-sm"
                    viewBox="0 0 240 120"
                  >
                    <defs>
                      <linearGradient
                        id="gaugeGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="25%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#eab308" />
                        <stop offset="75%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>

                    {/* Background track */}
                    <path
                      d="M 30 100 A 90 90 0 0 1 210 100"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />

                    {/* Gradient base */}
                    <path
                      d="M 30 100 A 90 90 0 0 1 210 100"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Active Gauge */}
                    {selectedLevel > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        fill="none"
                        stroke={getGaugeColor(selectedLevel)}
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          (getGaugeRotation(selectedLevel) / 180) * 282.7
                        } 282.7`}
                        className="transition-all duration-700 ease-out drop-shadow-sm"
                      />
                    )}
                  </svg>

                  {/* Running Man Icon with glow effect */}
                  <div className="absolute inset-0 flex items-end justify-center pb-6">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                          selectedLevel > 0 ? "0 scale-150" : ""
                        }`}
                      ></div>
                      <img
                        src={runningMan}
                        alt="Running figure"
                        className={`relative h-20 transition-all duration-500 ${
                          selectedLevel > 0 ? "scale-110" : "scale-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Activity Level Display */}
                <div className="text-center min-h-[100px] flex flex-col justify-center max-w-lg">
                  {selectedLevel > 0 ? (
                    <div className="space-y-3 transition-all duration-300 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-3xl">
                          {activityLevels[selectedLevel - 1].icon}
                        </span>
                        <h3 className="text-3xl font-bold text-plum">
                          {activityLevels[selectedLevel - 1].label}
                        </h3>
                      </div>
                      <p className="text-lg leading-relaxed text-gray-600">
                        {activityLevels[selectedLevel - 1].description}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xl font-medium text-gray-500">
                        Select your activity level below
                      </p>
                      <p className="text-sm text-gray-400">
                        Choose the option that best describes your lifestyle
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Improved Activity Level Cards */}
              <div className="grid grid-cols-5 gap-4 mb-12">
                {activityLevels.map((activity) => (
                  <button
                    key={activity.level}
                    onClick={() => setSelectedLevel(activity.level)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden ${
                      selectedLevel === activity.level
                        ? "border-lilac bg-gradient-to-br from-lilac/20 to-plum/10 text-plum shadow-lg scale-105 shadow-lilac/20"
                        : "border-gray-200 hover:border-lilac/60 text-gray-700 hover:bg-white bg-gray-50/50"
                    }`}
                  >
                    {/* Background decoration */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                        selectedLevel === activity.level
                          ? "from-lilac/10 to-plum/5 opacity-100"
                          : "from-gray-100/50 to-gray-50/50 opacity-0 group-hover:opacity-100"
                      }`}
                    ></div>

                    <div className="relative z-10 flex flex-col items-center space-y-3">
                      {/* Level number with enhanced styling */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                          selectedLevel === activity.level
                            ? "bg-lilac text-white shadow-lg"
                            : "bg-gray-200 text-gray-600 group-hover:bg-lilac/20 group-hover:text-plum"
                        }`}
                      >
                        {activity.level}
                      </div>

                      {/* Icon */}
                      <div className="text-2xl transition-transform duration-300 group-hover:scale-110">
                        {activity.icon}
                      </div>

                      {/* Label with better spacing */}
                      <div className="text-center">
                        <div className="text-sm font-semibold leading-tight">
                          {activity.label}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Enhanced Navigation */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-lg font-medium text-gray-600 transition-all duration-200 rounded-xl hover:text-plum hover:bg-gray-100"
                >
                  Skip for now
                </button>
                <div className="flex items-center space-x-6">
                  {selectedLevel > 0 && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-lilac animate-pulse"></div>
                      <span className="text-base font-medium">
                        Level {selectedLevel} selected
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleContinue}
                    disabled={selectedLevel === 0}
                    className={`group relative w-16 h-16 text-2xl font-bold text-white rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${
                      selectedLevel > 0
                        ? "bg-lilac hover:bg-plum cursor-pointer hover:scale-110 shadow-lg"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="relative z-10">{">"}</span>
                    {selectedLevel > 0 && (
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-plum group-hover:opacity-100"></div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Layout */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 md:hidden">
        <div className="w-full max-w-sm">
          {/* Progress Bar for Mobile */}
          <div className="mb-8">
            <ProgressBar currentStep={5} totalSteps={5} />
          </div>

          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold leading-tight text-plum">
              Rate your activity level!
            </h1>
            <p className="text-base text-gray-600">
              Help us personalize your fitness journey
            </p>
          </div>

          {/* Mobile Circular Gauge */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6 w-72 h-36">
              <svg
                className="w-full h-full drop-shadow-sm"
                viewBox="0 0 240 120"
              >
                <defs>
                  <linearGradient
                    id="mobileGaugeGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="75%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                <path
                  d="M 30 100 A 90 90 0 0 1 210 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  strokeLinecap="round"
                />

                <path
                  d="M 30 100 A 90 90 0 0 1 210 100"
                  fill="none"
                  stroke="url(#mobileGaugeGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.3"
                />

                {selectedLevel > 0 && (
                  <path
                    d="M 30 100 A 90 90 0 0 1 210 100"
                    fill="none"
                    stroke={getGaugeColor(selectedLevel)}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      (getGaugeRotation(selectedLevel) / 180) * 282.7
                    } 282.7`}
                    className="transition-all duration-700 ease-out drop-shadow-sm"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                      selectedLevel > 0 ? "scale-150" : ""
                    }`}
                  ></div>
                  <img
                    src={runningMan}
                    alt="Running figure"
                    className={`relative h-16 transition-all duration-500 ${
                      selectedLevel > 0 ? "scale-110 " : "scale-100"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Activity Level Display */}
            <div className="text-center min-h-[120px] flex flex-col justify-center px-4">
              {selectedLevel > 0 ? (
                <div className="space-y-3 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">
                      {activityLevels[selectedLevel - 1].icon}
                    </span>
                    <h3 className="text-xl font-bold text-plum">
                      {activityLevels[selectedLevel - 1].label}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {activityLevels[selectedLevel - 1].description}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-base font-medium text-gray-500">
                    Select your activity level below
                  </p>
                  <p className="text-xs text-gray-400">
                    Choose what best describes your lifestyle
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Activity Level Cards - Stacked for better readability */}
          <div className="mb-10 space-y-3">
            {activityLevels.map((activity) => (
              <button
                key={activity.level}
                onClick={() => setSelectedLevel(activity.level)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedLevel === activity.level
                    ? "border-lilac bg-gradient-to-r from-lilac/20 to-plum/10 text-plum shadow-lg"
                    : "border-gray-200 hover:border-lilac/60 text-gray-700 bg-white"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      selectedLevel === activity.level
                        ? "bg-lilac text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {activity.level}
                  </div>

                  <div className="text-xl">{activity.icon}</div>

                  <div className="flex-1 text-left">
                    <div className="text-base font-semibold">
                      {activity.label}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {activity.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-base font-medium text-gray-600 transition-all duration-200 rounded-lg hover:text-plum hover:bg-gray-100"
            >
              Skip
            </button>
            <div className="flex items-center space-x-4">
              {selectedLevel > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-lilac animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">
                    Level {selectedLevel}
                  </span>
                </div>
              )}
              <button
                onClick={handleContinue}
                disabled={selectedLevel === 0}
                className={`w-12 h-12 text-xl font-medium text-white rounded-full transition-all duration-300 flex items-center justify-center ${
                  selectedLevel > 0
                    ? "bg-lilac hover:bg-plum cursor-pointer hover:scale-110 shadow-lg"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLevels;
