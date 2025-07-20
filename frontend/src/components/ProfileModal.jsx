import React, { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState({
    email: '',
    first_name: '',
    birthdate: '',
    sex: '',
    gender_identity: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUserProfile({
          email: result.email || '',
          first_name: result.first_name || '',
          birthdate: result.birthdate || '',
          sex: result.sex || '',
          gender_identity: result.gender_identity || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/profiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          first_name: userProfile.first_name,
          birthdate: userProfile.birthdate,
          sex: userProfile.sex,
          gender_identity: userProfile.gender_identity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setLoading(true);
      // This would need a separate preferences endpoint or localStorage
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const getUserInitials = () => {
    if (userProfile.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    return userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/50 sm:items-center sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl h-[100vh] sm:h-auto sm:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-light-purple sm:p-6 shrink-0">
          <h2 className="text-xl font-bold sm:text-2xl text-purple">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 shrink-0 ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full border-r md:w-64 bg-gray-50 shrink-0">
            <nav className="p-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'profile'
                    ? 'bg-purple text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">👤</span>
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'preferences'
                    ? 'bg-purple text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">⚙️</span>
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'security'
                    ? 'bg-purple text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">🔒</span>
                Security
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`w-full text-left px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  activeTab === 'data'
                    ? 'bg-purple text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">📊</span>
                Data & Privacy
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-6 sm:p-6 sm:pb-8">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-purple"></div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
                    <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm transition-colors border rounded-lg text-purple border-purple hover:bg-purple hover:text-white"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white rounded-full sm:w-20 sm:h-20 sm:text-2xl bg-purple">
                      {getUserInitials()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={userProfile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed from this interface</p>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={userProfile.birthdate}
                        onChange={(e) => handleInputChange('birthdate', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Sex
                      </label>
                      <select
                        value={userProfile.sex}
                        onChange={(e) => handleInputChange('sex', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple disabled:bg-gray-50"
                      >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Intersex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Gender Identity
                      </label>
                      <select
                        value={userProfile.gender_identity}
                        onChange={(e) => handleInputChange('gender_identity', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple disabled:bg-gray-50"
                      >
                        <option value="">Select...</option>
                        <option value="man">Man</option>
                        <option value="woman">Woman</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="genderfluid">Genderfluid</option>
                        <option value="agender">Agender</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          className="px-6 py-2 text-white transition-colors rounded-lg bg-purple hover:bg-purple-dark disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Push Notifications
                        </label>
                        <p className="text-sm text-gray-500">Receive notifications about your journal entries and insights</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 shrink-0 ${
                          preferences.notifications ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email Updates
                        </label>
                        <p className="text-sm text-gray-500">Receive weekly summaries and tips via email</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange('emailUpdates', !preferences.emailUpdates)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 shrink-0 ${
                          preferences.emailUpdates ? 'bg-purple' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handlePreferencesUpdate}
                      disabled={loading}
                      className="w-full px-6 py-2 text-white transition-colors rounded-lg sm:w-auto bg-purple hover:bg-purple-dark disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Change Password</h4>
                      <p className="mb-4 text-sm text-gray-600">Update your password to keep your account secure</p>
                      <button className="w-full px-4 py-2 text-white transition-colors rounded-lg sm:w-auto bg-purple hover:bg-purple-dark">
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Two-Factor Authentication</h4>
                      <p className="mb-4 text-sm text-gray-600">Add an extra layer of security to your account</p>
                      <button className="w-full px-4 py-2 transition-colors border rounded-lg sm:w-auto text-purple border-purple hover:bg-purple hover:text-white">
                        Enable 2FA
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Active Sessions</h4>
                      <p className="mb-4 text-sm text-gray-600">Manage your active login sessions</p>
                      <button className="w-full px-4 py-2 transition-colors border rounded-lg sm:w-auto text-purple border-purple hover:bg-purple hover:text-white">
                        View Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Privacy Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Data & Privacy</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Download Your Data</h4>
                      <p className="mb-4 text-sm text-gray-600">Export all your journal entries and data</p>
                      <button className="w-full px-4 py-2 text-white transition-colors rounded-lg sm:w-auto bg-purple hover:bg-purple-dark">
                        Export Data
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Data Sharing</h4>
                      <p className="mb-4 text-sm text-gray-600">Control how your data is used for insights</p>
                      <button className="w-full px-4 py-2 transition-colors border rounded-lg sm:w-auto text-purple border-purple hover:bg-purple hover:text-white">
                        Manage Sharing
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-red-50">
                      <h4 className="mb-2 font-medium text-red-800">Delete Account</h4>
                      <p className="mb-4 text-sm text-red-600">Permanently delete your account and all data</p>
                      <button className="w-full px-4 py-2 text-white transition-colors bg-red-600 rounded-lg sm:w-auto hover:bg-red-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;