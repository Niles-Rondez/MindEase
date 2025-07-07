import React, { useState } from 'react';
import MoodSlider from './MoodSlider';
import ImageUpload from './ImageUpload';

function JournalModal({ isOpen, onClose, onSave, userId }) {
  const [thoughts, setThoughts] = useState('');
  const [images, setImages] = useState([]);
  const [mood, setMood] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const moodColorMap = {
    1: 'Red',
    2: 'Orange',
    3: 'Yellow',
    4: 'Green',
    5: 'Blue'
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('entry_text', thoughts);
      formData.append('mood_rating', moodColorMap[mood]);

      images.forEach((img) => {
        if (img.file) formData.append('file', img.file);
      });

      const response = await fetch('http://localhost:3000/api/journal-entries', {
        method: 'POST',
        body: formData
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : null;

      if (response.ok && result?.success) {
        await onSave(result.entry);
        handleDiscard();
      } else {
        alert('Failed to save journal entry.');
        console.error('Journal entry error:', result?.error || 'Unknown error');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setThoughts('');
    setImages([]);
    setMood(3);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between flex-shrink-0 p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-all duration-200 rounded-full hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto">
          {/* Thoughts Section */}
          <div className="mb-8">
            <label className="block mb-3 text-lg font-semibold text-gray-800">
              Thoughts
            </label>
            <textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="How was your day? Share your thoughts, feelings, and experiences..."
              className="w-full p-4 text-gray-700 transition-all duration-200 border border-gray-300 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-lilac focus:border-transparent"
              rows={6}
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <label className="block mb-3 text-lg font-semibold text-gray-800">
              What does your day look like?
            </label>
            <ImageUpload images={images} setImages={setImages} />
          </div>

          {/* Mood Rating Section */}
          <div className="mb-6">
            <label className="block mb-3 text-lg font-semibold text-gray-800">
              How are you feeling today?
            </label>
            <MoodSlider mood={mood} setMood={setMood} />
          </div>
        </div>

        {/* Footer Buttons - Fixed */}
        <div className="flex flex-shrink-0 gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDiscard}
            className="flex-1 px-6 py-3 font-medium text-gray-600 transition-all duration-200 border border-gray-300 rounded-full cursor-pointer hover:bg-red-400 hover:text-white"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-3 font-medium text-white transition-all duration-200 rounded-full cursor-pointer flex-4 bg-lilac hover:bg-purple-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save to Journal'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JournalModal;