import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, userId, currentPage, onNavigate, onSignOut }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar 
        userId={userId} 
        currentPage={currentPage}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;