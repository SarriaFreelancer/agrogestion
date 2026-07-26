import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-transparent overflow-hidden text-[var(--text-contrast)]">
      {children}
    </div>
  );
};

export default MainLayout;
