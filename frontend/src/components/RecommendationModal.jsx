import React from 'react';
import { X, Clock, CheckCircle, Star } from 'lucide-react';

const RecommendationModal = ({ isOpen, onClose, recommendation }) => {
  if (!isOpen || !recommendation) return null;

  const getStepIcon = (index) => {
    const icons = ['🎯', '📝', '⏰', '🌟', '💡'];
    return icons[index % icons.length];
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getInstructions = (title) => {
    const instructions = {
      'Morning Meditation': {
        duration: '10-15 minutes',
        bestTime: 'Early morning (6-8 AM)',
        steps: [
          'Find a quiet, comfortable space in your home',
          'Sit comfortably with your back straight',
          'Close your eyes and focus on your breathing',
          'When thoughts arise, gently return focus to your breath',
          'Start with 5 minutes and gradually increase to 10-15 minutes'
        ],
        tips: [
          'Use a meditation app like Headspace or Calm for guidance',
          'Set a consistent time each day to build the habit',
          'Don\'t judge yourself - meditation is a practice'
        ]
      },
      'Wednesday Wind-Down': {
        duration: '30-60 minutes',
        bestTime: 'After work (5-7 PM)',
        steps: [
          'Schedule a specific relaxing activity every Wednesday',
          'Choose activities like reading, gentle yoga, or a warm bath',
          'Turn off work notifications and electronic devices',
          'Create a calming environment with soft lighting or candles',
          'Focus on being present and enjoying the moment'
        ],
        tips: [
          'Prepare your wind-down activity in advance',
          'Try different activities to find what works best for you',
          'Make this a non-negotiable part of your Wednesday routine'
        ]
      },
      'Social Connection': {
        duration: '1-2 hours',
        bestTime: 'Tuesday evening or lunch',
        steps: [
          'Reach out to a friend or family member on Monday',
          'Schedule a specific time to connect on Tuesday',
          'Choose meaningful activities like coffee, lunch, or a walk',
          'Put away phones and focus on genuine conversation',
          'Express gratitude for the relationship'
        ],
        tips: [
          'Alternate who you connect with each week',
          'Virtual connections count too - video calls work great',
          'Quality over quantity - focus on meaningful conversations'
        ]
      },
      'Gratitude Journaling': {
        duration: '5-10 minutes',
        bestTime: 'Morning or before bed',
        steps: [
          'Get a dedicated notebook or use a journaling app',
          'Write down 3 specific things you\'re grateful for',
          'Include why each item makes you grateful',
          'Focus on different aspects of life (relationships, experiences, small moments)',
          'Review previous entries weekly to notice patterns'
        ],
        tips: [
          'Be specific rather than general in your gratitude',
          'Include both big and small things you\'re grateful for',
          'Make it a daily habit by linking it to an existing routine'
        ]
      },
      'Stress-Relief Playlist': {
        duration: '20-30 minutes',
        bestTime: 'During stressful moments',
        steps: [
          'Create a playlist with 8-12 calming songs',
          'Include instrumental music, nature sounds, or soft vocals',
          'Test different genres to find what relaxes you most',
          'Save the playlist for easy access during stress',
          'Use with headphones for better immersion'
        ],
        tips: [
          'Update your playlist monthly to keep it fresh',
          'Include songs that have positive memories attached',
          'Consider binaural beats or meditation music'
        ]
      },
      'Weekly Goal Setting': {
        duration: '15-20 minutes',
        bestTime: 'Sunday evening or Monday morning',
        steps: [
          'Review the previous week\'s goals and progress',
          'Set 2-3 specific, achievable goals for the upcoming week',
          'Break larger goals into smaller daily actions',
          'Write goals in a visible place or digital reminder',
          'Schedule specific times to work on each goal'
        ],
        tips: [
          'Make goals SMART: Specific, Measurable, Achievable, Relevant, Time-bound',
          'Celebrate small wins throughout the week',
          'Adjust goals if needed - flexibility is key'
        ]
      }
    };

    return instructions[title] || {
      duration: '10-15 minutes',
      bestTime: 'When convenient',
      steps: ['Follow the general guidance for this activity'],
      tips: ['Customize this practice to fit your lifestyle']
    };
  };

  const instructions = getInstructions(recommendation.title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-plum-100">
              {recommendation.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{recommendation.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(recommendation.difficulty)}`}>
                  {recommendation.difficulty}
                </span>
                <span className="px-2 py-1 text-xs rounded text-plum-700 bg-plum-100">
                  {recommendation.type}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="p-4 rounded-lg bg-lilac-50">
            <p className="text-sm text-lilac-800">{recommendation.description}</p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Duration</span>
              </div>
              <p className="text-xs text-green-700">{instructions.duration}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Best Time</span>
              </div>
              <p className="text-xs text-blue-700">{instructions.bestTime}</p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Step-by-Step Guide</h3>
            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-center w-6 h-6 mt-0.5 text-sm bg-plum-100 rounded-full">
                    {getStepIcon(index)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Pro Tips</h3>
            <div className="space-y-2">
              {instructions.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-plum-50 to-lilac-50">
            <h4 className="mb-2 text-sm font-semibold text-plum-800">Ready to get started?</h4>
            <p className="mb-3 text-xs text-plum-700">
              Remember, small consistent actions lead to big changes. Start with just one step today!
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-plum-600 hover:bg-plum-700"
            >
              Let's Do This!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;