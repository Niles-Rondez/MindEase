import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, Heart, Loader2 } from 'lucide-react';

const LogbookModal = ({ isOpen, onClose, entry }) => {
  if (!isOpen || !entry) return null;

  // Format date to show nicely in modal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ADDED: Function to get mood text from emoji
  const getMoodFromEmoji = (emoji) => {
    const emojiToMood = {
      '😢': 'Very Sad',
      '😕': 'Sad',
      '😐': 'Neutral', 
      '😊': 'Happy',
      '😄': 'Very Happy'
    };
    return emojiToMood[emoji] || 'Neutral';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{entry.moodEmoji}</span>
            <div>
              {/* FIXED: Use the mood text from the entry or convert from emoji */}
              <h2 className="text-xl font-bold text-gray-800">
                {entry.mood || getMoodFromEmoji(entry.moodEmoji)}
              </h2>
              <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-all duration-200 rounded-full hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Journal Entry</h3>
            <p className="leading-relaxed text-gray-700">{entry.entry}</p>
          </div>

          {/* Show images if they exist */}
          {entry.images && entry.images.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {entry.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Journal entry ${index + 1}`}
                    className="object-cover w-full h-48 rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Logbook = ({ userId }) => {
  // State for modal
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // NEW: Debounced search term
  const [moodFilter, setMoodFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  
  // State for API data
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // NEW: Ref for the debounce timeout
  const debounceTimeout = useRef(null);

  // Options for mood filter dropdown
  const moodOptions = ['All', 'Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];

  // NEW: Debounce effect for search term
  useEffect(() => {
    // Clear the previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    // Cleanup function to clear timeout if component unmounts or searchTerm changes
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  // Main function to get entries from API
  const fetchEntries = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      // Build the API URL with parameters
      const params = new URLSearchParams({
        userId: userId,
        limit: '50',
        offset: reset ? '0' : '0' // You can add pagination later
      });

      // Add filters to URL if they are set
      if (moodFilter !== 'All') {
        // Convert mood text to rating number
        const moodRating = getMoodRating(moodFilter);
        if (moodRating) {
          params.append('mood', moodRating);
        }
      }

      // UPDATED: Use debounced search term instead of immediate search term
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }

      // Add date filters
      if (dateFilter !== 'All') {
        const dateRange = getDateRange(dateFilter);
        if (dateRange.from) params.append('dateFrom', dateRange.from);
        if (dateRange.to) params.append('dateTo', dateRange.to);
      }

      // Call the API
      const apiUrl = `http://localhost:3000/api/get-journal-entries?${params}`;
      
      console.log('Fetching from:', apiUrl);
      const response = await fetch(apiUrl);
      
      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        throw new Error(`Server returned ${response.status}: ${textResponse.substring(0, 200)}...`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to fetch entries`);
      }

      if (data.success) {
        setEntries(data.entries);
        setHasMore(data.hasMore);
      } else {
        throw new Error(data.error || 'Failed to fetch entries');
      }
    } catch (err) {
      console.error('Full error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert mood text to rating number for API
  const getMoodRating = (moodText) => {
    const moodMap = {
      'Very Sad': '1',
      'Sad': '2',
      'Neutral': '3',
      'Happy': '4',
      'Very Happy': '5'
    };
    return moodMap[moodText];
  };

  // Get date range based on filter selection
  const getDateRange = (filter) => {
    const now = new Date();
    const ranges = {
      'This Week': {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: now.toISOString()
      },
      'This Month': {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        to: now.toISOString()
      },
      'Last 3 Months': {
        from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: now.toISOString()
      }
    };
    return ranges[filter] || {};
  };

  // UPDATED: Get entries when component loads or filters change (now uses debouncedSearchTerm)
  useEffect(() => {
    if (userId) {
      fetchEntries(true);
    }
  }, [userId, moodFilter, dateFilter, debouncedSearchTerm]);

  // Open modal with selected entry
  const openModal = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Cut text if it's too long
  const truncateText = (text, wordLimit = 15) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, weekday };
  };

  // Get month and year for grouping
  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group entries by month for display
  const groupedEntries = entries.reduce((groups, entry) => {
    const monthYear = getMonthYear(entry.date);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(entry);
    return groups;
  }, {});

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-500 animate-spin" />
          <p className="text-gray-600">Loading your journal entries...</p>
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-400">⚠️</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-600">Error loading entries</h3>
          <p className="mb-4 text-gray-500">{error}</p>
          <button
            onClick={() => fetchEntries(true)}
            className="px-4 py-2 text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center w-full min-h-screen">
        <div className="w-full mx-auto max-w-7xl">
          {/* Header */}
          <div className="p-5 lg:px-10 lg:py-5">
            <h1 className="text-2xl font-bold">📖 Logbook</h1>
            <p className="text-md text-black/50">Review your mental wellness journey through your journal entries.</p>
          </div>

{/* Filter Section */}
<div className="p-4 lg:px-10">
  <div className="p-4 mb-6 bg-white shadow rounded-xl">
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
        {/* Show a subtle indicator when search is being debounced */}
        {searchTerm !== debouncedSearchTerm && (
          <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Filter Row - Horizontal on mobile, continues horizontal on desktop */}
      <div className="flex gap-4 lg:gap-2">
        {/* Mood Filter */}
        <div className="flex items-center flex-1 gap-2 lg:flex-initial">
          <Heart className="w-4 h-4 text-gray-400" />
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          >
            {moodOptions.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center flex-1 gap-2 lg:flex-initial">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          >
            <option value="All">All Time</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Monthly Log Squares */}
          <div className="p-4 lg:px-10">
            {Object.keys(groupedEntries).length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl text-gray-400">📝</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-600">No journal entries found</h3>
                <p className="text-gray-500">Try adjusting your filters or start writing in your journal!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.entries(groupedEntries).map(([monthYear, entries]) => (
                  <div key={monthYear} className="p-6 bg-white shadow rounded-xl">
                    <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
                      {monthYear}
                    </h2>
                    
                    <div className="space-y-2">
                      {entries.map((entry) => {
                        const { day, weekday } = formatDate(entry.date);
                        return (
                          <div
                            key={entry.id}
                            onClick={() => openModal(entry)}
                            className="grid grid-cols-12 gap-3 p-3 transition-all duration-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-sm"
                          >
                            {/* Date */}
                            <div className="col-span-2 text-center">
                              <div className="text-lg font-bold text-gray-800">{day}</div>
                              <div className="text-xs text-gray-500">{weekday}</div>
                            </div>
                            
                            {/* Mood */}
                            <div className="flex items-center justify-center col-span-2">
                              <span className="text-xl">{entry.moodEmoji}</span>
                            </div>
                            
                            {/* Entry Preview */}
                            <div className="col-span-8">
                              <p className="text-sm leading-relaxed text-gray-700">
                                {truncateText(entry.entry, 8)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <LogbookModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        entry={selectedEntry}
      />
    </div>
  );
};

export default Logbook;