
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, backgroundImage }) => {
  return (
    <div 
      className="min-h-screen w-full relative overflow-x-hidden flex flex-col"
      style={{
        backgroundImage: backgroundImage ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 z-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
