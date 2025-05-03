import React from "react";
import Sidebar from "./_components/Sidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-full lg:ml-64 p-5">{children}</div>
    </div>
  );
};

export default MainLayout;
