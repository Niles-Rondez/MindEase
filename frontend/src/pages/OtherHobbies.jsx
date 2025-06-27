import ProgressBar from "../components/ProgressBar";
import HobbyGroup from "../components/HobbyGroup";
import React, { useState } from "react";

const otherHobbiesData = {
  "Social/Community": [
    { id: 78, name: "Volunteering", icon: "🤝" },
    { id: 79, name: "Event Organizing", icon: "🎉" },
    { id: 80, name: "Joining Clubs/Fan Communities", icon: "👥" },
    { id: 81, name: "Public Speaking", icon: "🎤" },
  ],
};

function OtherHobbies({ onContinue, onSkip }) {
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleHobbyToggle = (hobbyId) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobbyId)
        ? prev.filter((id) => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const handleContinue = () => {
    onContinue(selectedHobbies);
  };

  const handleSkip = () => {
    onSkip();
  };

  // Filter hobby groups based on search term
  const getFilteredHobbyGroups = () => {
    if (!searchTerm) return otherHobbiesData;

    const filtered = {};
    Object.entries(otherHobbiesData).forEach(([groupName, hobbies]) => {
      const filteredHobbies = hobbies.filter(
        (hobby) =>
          hobby.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          groupName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredHobbies.length > 0) {
        filtered[groupName] = filteredHobbies;
      }
    });
    return filtered;
  };

  const filteredHobbyGroups = getFilteredHobbyGroups();

  return (
    <div className="min-h-screen font-sans md:bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden h-screen md:flex">
        <div className="flex items-center justify-center flex-1 px-8">
          <div className="w-full max-w-2xl">
            {/* Progress Bar */}
            <ProgressBar currentStep={4} totalSteps={5} />

            <div className="p-8 bg-white shadow-lg/20 rounded-2xl lg:p-10">
              <h2 className="mb-6 text-2xl font-bold text-plum lg:text-3xl lg:mb-8">
                Are there any other we might've missed?
              </h2>

              {/* Search Input with Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search hobbies..."
                  className="w-full py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac"
                />
              </div>

              {/* Hobby Groups */}
              <div className="pr-2 space-y-1 overflow-y-auto max-h-80">
                {Object.entries(filteredHobbyGroups).map(
                  ([groupName, hobbies]) => (
                    <HobbyGroup
                      key={groupName}
                      title={groupName}
                      hobbies={hobbies}
                      selectedHobbies={selectedHobbies}
                      onHobbyToggle={handleHobbyToggle}
                    />
                  )
                )}
                {Object.keys(filteredHobbyGroups).length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No hobbies found matching "{searchTerm}"
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-lg font-medium text-gray-600 transition-all duration-200 rounded-xl hover:text-plum hover:bg-gray-100"
                >
                  Skip
                </button>
                <div className="flex items-center space-x-4">
                  {selectedHobbies.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedHobbies.length} selected
                    </span>
                  )}
                  <button
                    onClick={handleContinue}
                    disabled={selectedHobbies.length === 0}
                    className={`w-12 h-12 text-2xl font-bold text-white rounded-full transition-all duration-200 flex items-center justify-center ${
                      selectedHobbies.length > 0
                        ? "bg-lilac hover:bg-plum cursor-pointer"
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
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 md:hidden">
        <div className="w-full max-w-sm">
          {/* Progress Bar for Mobile */}
          <ProgressBar currentStep={2} totalSteps={5} />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-plum">
              Are there any other we might've missed?
            </h1>
          </div>

          {/* Search Input with Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hobbies..."
              className="w-full py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac"
            />
          </div>

          {/* Hobby Groups */}
          <div className="pr-2 space-y-1 overflow-y-auto max-h-120">
            {Object.entries(filteredHobbyGroups).map(([groupName, hobbies]) => (
              <HobbyGroup
                key={groupName}
                title={groupName}
                hobbies={hobbies}
                selectedHobbies={selectedHobbies}
                onHobbyToggle={handleHobbyToggle}
              />
            ))}
            {Object.keys(filteredHobbyGroups).length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No hobbies found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-lg font-medium text-gray-600 transition-all duration-200 rounded-xl hover:text-plum hover:bg-gray-100"
            >
              Skip
            </button>
            <div className="flex items-center space-x-4">
              {selectedHobbies.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedHobbies.length} selected
                </span>
              )}
              <button
                onClick={handleContinue}
                disabled={selectedHobbies.length === 0}
                className={`w-12 h-12 text-2xl font-bold text-white rounded-full transition-all duration-200 flex items-center justify-center ${
                  selectedHobbies.length > 0
                    ? "bg-lilac hover:bg-plum cursor-pointer"
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

export default OtherHobbies;
