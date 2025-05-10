"use client";

import { DollarSign, Home, List, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathName = usePathname();
  console.log("PAth is", pathName);

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const mobileMenuItemsStyle =
    "flex items-center px-4 py-3 gap-3 rounded-md transition-colors font-medium";

  return (
    <>
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-gray-600 opacity-50 z-20 fixed inset-0" />
      )}
      <button
        className="lg:hidden fixed bottom-4 right-4 rounded-full p-3 text-white bg-primary-600 shadow-lg z-30"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              isMobileMenuOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M4 6h16M4 12h16M4 18h16"
            }
          />
        </svg>
      </button>

      <aside
        className={`h-full bg-white border-r border-gray-200 w-64 flex flex-col fixed left-0 z-20 transition-transform transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="text-primary-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900 ml-2">FinTrack</h1>
          </div>
          <p className="mt-1 text-xs text-gray-500">Personal Finance Manager</p>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            href={"/dashboard"}
            onClick={handleCloseMobileMenu}
            className={`flex items-center px-3 py-4 gap-3 rounded-md transition-colors font-medium ${
              pathName === "/dashboard"
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Home size={18} />
            Dashboard
          </Link>
          <Link
            href={"/transactions"}
            onClick={handleCloseMobileMenu}
            className={`flex items-center px-3 py-4 gap-3 rounded-md transition-colors font-medium ${
              pathName === "/transactions"
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <TrendingUp size={18} />
            Transactions
          </Link>
          <Link
            href={"/budgets"}
            onClick={handleCloseMobileMenu}
            className={`flex items-center px-3 py-4 gap-3 rounded-md transition-colors font-medium ${
              pathName === "/budgets"
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <PieChart size={18} />
            Budgets
          </Link>
          <Link
            href={"/categories"}
            onClick={handleCloseMobileMenu}
            className={`flex items-center px-3 py-4 gap-3 rounded-md transition-colors font-medium ${
              pathName === "/categories"
                ? "bg-primary-50 text-primary-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <List size={18} />
            Categories
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
