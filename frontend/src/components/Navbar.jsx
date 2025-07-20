import React, { useState, useEffect, useRef } from 'react';
import JournalModal from './JournalModal';
import ProfileModal from './ProfileModal';
import logo from '../assets/logo.png';

function Navbar({ userId, currentPage, onNavigate, onSignOut }) { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [userInitials, setUserInitials] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const dropdownRef = useRef(null);

    // Navigation items
    const navItems = [
        { name: 'Dashboard', path: 'dashboard', icon: '' },
        { name: 'AI Insights', path: 'insights', icon: '' },
        { name: 'Logbook', path: 'logbook', icon: '' }
    ];

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get user info (you'll need to implement this based on your auth system)
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Replace with your actual user data fetching logic
                const response = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
                const result = await response.json();
                
                if (result.success) {
                    const email = result.email || 'user@example.com';
                    setUserEmail(email);
                    setUserInitials(email.charAt(0).toUpperCase());
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                setUserInitials('U');
            }
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const openJournalModal = () => {
        setIsJournalModalOpen(true);
        setIsMenuOpen(false); // Close mobile menu if open
    };

    const handleNavigation = (path) => {
        onNavigate(path);
        setIsMenuOpen(false); // Close mobile menu after navigation
    };

    const handleSaveJournal = (journalEntry) => {
        // Handle the journal entry save here
        console.log('Journal entry saved:', journalEntry);
        // You can add your save logic here (API call, state management, etc.)
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleSignOut = () => {
        setIsProfileDropdownOpen(false);
        onSignOut();
    };

    return (
        <>
            <nav className="sticky top-0 z-50 shadow-md bg-light-purple">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="MindEase Logo" className="h-8" />
                            <button 
                                onClick={() => handleNavigation('dashboard')}
                                className="text-2xl font-bold transition-colors duration-200 text-purple hover:text-purple-dark"
                            >
                                MindEase
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="items-center hidden gap-5 space-x-4 text-lg font-medium md:flex">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`relative transition-all duration-200 hover:text-white hover:scale-110 hover:text-shadow-lg cursor-pointer ${
                                        currentPage === item.path 
                                            ? 'text-white font-bold after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full' 
                                            : 'text-purple'
                                    }`} 
                                >
                                    <span className="hidden mr-2 lg:inline">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                            
                            <button 
                                onClick={openJournalModal}
                                className="px-5 py-2 text-white transition-all duration-200 rounded-full hover:text-white hover:bg-purple-dark bg-purple hover:cursor-pointer hover:scale-105 hover:shadow-lg"
                            >
                                <span className="mr-2">+</span>
                                Journal
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center justify-center w-10 h-10 text-white transition-all duration-200 rounded-full cursor-pointer bg-purple hover:bg-purple-dark hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                                >
                                    {userInitials}
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-lilac ring-opacity-5">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700">
                                                <p className="font-medium">Signed in as</p>
                                                <p className="text-gray-500 truncate">{userEmail}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsProfileModalOpen(true);
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 cursor-pointer hover:bg-gray-50"
                                            >
                                                👤 Profile Settings
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Add preferences/settings navigation
                                                    setIsProfileModalOpen(true);
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 cursor-pointer hover:bg-gray-50"
                                            >
                                                ⚙️ Preferences
                                            </button>
                                            <div className="">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="block w-full px-4 py-2 text-sm text-left cursor-pointer text-red-60 hover:bg-red-400/20"
                                                >
                                                    🚪 Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Burger Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 transition-all duration-200 rounded-md cursor-pointer text-purple hover:text-white hover:bg-purple focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Hamburger icon */}
                                <svg
                                    className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                {/* Close icon */}
                                <svg
                                    className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-200 ease-in-out`}>
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full text-left block px-3 py-2 text-base font-medium transition-all duration-200 rounded-md ${
                                        currentPage === item.path 
                                            ? 'text-white bg-purple' 
                                            : 'text-purple hover:text-white hover:bg-purple'
                                    }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </button>
                            ))}
                            
                            <div className="px-3 py-2">
                                <button 
                                    onClick={openJournalModal}
                                    className="w-full px-4 py-2 text-white transition-all duration-200 rounded-full cursor-pointer bg-purple hover:bg-purple-dark hover:font-medium hover:scale-105"
                                >
                                    <span className="mr-2">✏️</span>
                                    Journal
                                </button>
                            </div>

                            {/* Mobile Profile Section */}
                            <div className="px-3 py-2 border-t">
                                <div className="flex items-center py-2">
                                    <div className="flex items-center justify-center w-8 h-8 mr-3 text-white rounded-full bg-purple">
                                        {userInitials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Profile</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsProfileModalOpen(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="block w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md"
                                >
                                    👤 Profile Settings
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="block w-full px-3 py-2 text-sm text-left text-red-600 rounded-md bg-red-500/20"
                                >
                                    🚪 Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Journal Modal */}
            <JournalModal 
                isOpen={isJournalModalOpen}
                onClose={() => setIsJournalModalOpen(false)}
                onSave={handleSaveJournal}
                userId={userId}
            />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userId={userId}
            />
        </>
    );
}

export default Navbar;