import React, { useState } from 'react';
import JournalModal from './JournalModal';
import logo from '../assets/logo.png';

function Navbar({ userId }) { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const openJournalModal = () => {
        setIsJournalModalOpen(true);
        setIsMenuOpen(false); // Close mobile menu if open
    };

    const handleSaveJournal = (journalEntry) => {
        // Handle the journal entry save here
        console.log('Journal entry saved:', journalEntry);
        // You can add your save logic here (API call, state management, etc.)
    };

    return (
        <>
            <nav className="sticky top-0 shadow-md bg-light-purple">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="MindEase Logo" className="h-8" />
                            <a href="/" className="text-2xl font-bold text-gray-800 text-purple">MindEase</a>
                        </div>

                        {/* Desktop Menu */}
                        <div className="items-center hidden gap-5 space-x-4 text-2xl font-medium md:flex">
                            <a href="/dashboard" className="transition-all duration-200 text-purple hover:text-white hover:scale-110 hover:text-shadow-lg">Dashboard</a>
                            <a href="/journal" className="transition-all duration-200 text-purple hover:text-white hover:scale-110 hover:text-shadow-lg">Journal</a>
                            <a href="/insights" className="transition-all duration-200 text-purple hover:text-white hover:scale-110 hover:text-shadow-lg">AI Insights</a>
                            <button 
                                onClick={openJournalModal}
                                className="px-5 py-1 text-white transition-all duration-200 rounded-full hover:text-white hover:bg-purple bg-purple hover:cursor-pointer hover:scale-105 hover:shadow-md/10"
                            >
                                + Journal
                            </button>
                        </div>

                        {/* Mobile Burger Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 transition-all duration-200 rounded-md cursor-pointer text-purple hover:text-white hover:bg-purple focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple"
                                aria-expanded="false"
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
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <a 
                                href="/dashboard" 
                                className="block px-3 py-2 text-base font-medium transition-all duration-200 rounded-md text-purple hover:text-white hover:bg-purple"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </a>
                            <a 
                                href="/journal" 
                                className="block px-3 py-2 text-base font-medium transition-all duration-200 rounded-md text-purple hover:text-white hover:bg-purple"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Journal
                            </a>
                            <a 
                                href="/insights" 
                                className="block px-3 py-2 text-base font-medium transition-all duration-200 rounded-md text-purple hover:text-white hover:bg-purple"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                AI Insights
                            </a>
                            <div className="px-3 py-2">
                                <button 
                                    onClick={openJournalModal}
                                    className="w-full px-4 py-2 text-white rounded-full cursor-pointer bg-purple hover:bg-purple hover:font-medium hover:scale-105"
                                >
                                    + Journal
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
        </>
    );
}

export default Navbar;