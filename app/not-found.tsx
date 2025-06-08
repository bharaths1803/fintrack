import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Home, ArrowLeft, Search, HelpCircle, DollarSign } from "lucide-react";
import Link from "next/link";

const NotFound = async () => {
  const { userId } = await auth();

  const suggestions = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <Home size={16} />,
      auth: true,
    },
    {
      label: "Transactions",
      path: "/transactions",
      icon: <DollarSign size={16} />,
      auth: true,
    },
    {
      label: "Budgets",
      path: "/budgets",
      icon: <DollarSign size={16} />,
      auth: true,
    },
    {
      label: "Accounts",
      path: "/accounts",
      icon: <DollarSign size={16} />,
      auth: true,
    },
    { label: "Home", path: "/", icon: <Home size={16} />, auth: false },
    {
      label: "Sign In",
      path: "/signin",
      icon: <DollarSign size={16} />,
      auth: false,
    },
    {
      label: "Sign Up",
      path: "/signup",
      icon: <DollarSign size={16} />,
      auth: false,
    },
  ];

  const relevantSuggestions = suggestions.filter((suggestion) =>
    userId ? suggestion.auth : !suggestion.auth
  );

  return (
    <div className="pt-20 bg-gradient-to-br from-gray-50 to-primary-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-primary-200 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <p className="text-gray-500">
              Don't worry, let's get you back on track with your financial
              journey.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 mr-2 text-primary-600" />
              Where would you like to go?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relevantSuggestions.map((suggestion, index) => (
                <Link
                  key={index}
                  href={suggestion.path}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center mr-3 transition-colors">
                    <div className="text-gray-600 group-hover:text-primary-600 transition-colors">
                      {suggestion.icon}
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                    {suggestion.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
