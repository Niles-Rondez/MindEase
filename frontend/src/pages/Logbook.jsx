import React, { useState } from 'react';
import { Search, Filter, Calendar, Heart } from 'lucide-react';

// Mock data for demonstration
const mockJournalEntries = [
  {
    id: 1,
    date: '2025-06-22',
    mood: 'Happy',
    moodEmoji: '🙂',
    entry: 'Today was an amazing day! I went to the park with my friends and we had such a great time playing frisbee and having a picnic. The weather was perfect and I felt so grateful for these moments.',
    images: []
  },
  {
    id: 2,
    date: '2025-06-21',
    mood: 'Neutral',
    moodEmoji: '😐',
    entry: 'Just a regular day at work. Nothing special happened but I got through my tasks efficiently. Looking forward to the weekend.',
    images: []
  },
  {
    id: 3,
    date: '2025-06-20',
    mood: 'Very Happy',
    moodEmoji: '😊',
    entry: 'Got promoted at work today! I am so excited and proud of myself. All the hard work has finally paid off. Celebrating with dinner tonight.',
    images: []
  },
  {
    id: 4,
    date: '2025-06-19',
    mood: 'Sad',
    moodEmoji: '🙁',
    entry: 'Had a difficult conversation with my family today. Feeling a bit down but I know things will get better. Sometimes these tough moments help us grow.',
    images: []
  },
  {
    id: 5,
    date: '2025-06-18',
    mood: 'Happy',
    moodEmoji: '🙂',
    entry: 'Started reading a new book today and I absolutely love it! Spent the entire afternoon curled up with it and some hot tea. Perfect way to relax.',
    images: []
  },
  {
    id: 6,
    date: '2025-05-15',
    mood: 'Very Happy',
    moodEmoji: '😊',
    entry: 'Graduated from college today! Such an incredible milestone. My family was there to support me and I felt so loved and accomplished.',
    images: []
  },
  {
    id: 7,
    date: '2025-05-10',
    mood: 'Neutral',
    moodEmoji: '😐',
    entry: 'Studying for finals. Feeling stressed but manageable. Just need to push through these last few weeks.',
    images: []
  },
  {
    id: 8,
    date: '2025-04-28',
    mood: 'Happy',
    moodEmoji: '🙂',
    entry: 'Spring is finally here! Went for a long walk in the botanical gardens. The flowers are blooming beautifully and it lifted my spirits.',
    images: []
  }
];

const LogbookModal = ({ isOpen, onClose, entry }) => {
  if (!isOpen || !entry) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{entry.moodEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{entry.mood}</h2>
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
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const moodOptions = ['All', 'Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const truncateText = (text, wordLimit = 15) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, weekday };
  };

  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter entries
  const filteredEntries = mockJournalEntries.filter(entry => {
    const matchesSearch = entry.entry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = moodFilter === 'All' || entry.mood === moodFilter;
    const entryDate = new Date(entry.date);
    const currentDate = new Date();
    
    let matchesDate = true;
    if (dateFilter === 'This Week') {
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = entryDate >= weekAgo;
    } else if (dateFilter === 'This Month') {
      matchesDate = entryDate.getMonth() === currentDate.getMonth() && 
                   entryDate.getFullYear() === currentDate.getFullYear();
    } else if (dateFilter === 'Last 3 Months') {
      const threeMonthsAgo = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      matchesDate = entryDate >= threeMonthsAgo;
    }
    
    return matchesSearch && matchesMood && matchesDate;
  });

  // Group entries by month
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const monthYear = getMonthYear(entry.date);
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(entry);
    return groups;
  }, {});

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
                </div>

                {/* Mood Filter */}
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <select
                    value={moodFilter}
                    onChange={(e) => setMoodFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  >
                    {moodOptions.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
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