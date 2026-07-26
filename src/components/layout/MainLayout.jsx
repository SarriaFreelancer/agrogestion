import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {children}
    </div>
  );
};

export default MainLayout;
