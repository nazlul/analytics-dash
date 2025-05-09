import React from 'react';

const MainNav: React.FC = () => {
  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-sky-300 text-blue-900 rounded-lg mb-4">
      <div className="flex items-center">
        <img src="/assets/dotheal-logo.png" alt="Logo" className="h-10 mr-3" />
        <h1 className="text-xl font-semibold">Ads Analytics</h1>
      </div>
    </nav>
  );
};

export default MainNav;
