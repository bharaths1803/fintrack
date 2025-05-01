import React from "react";
import Sidebar from "./_components/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      {children}
    </div>
  );
};

export default MainLayout;
