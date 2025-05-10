import { BarChart2, ChevronRight, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Footer from "./_components/Footer";

export default function Home() {
  const features = [
    {
      icon: <PieChart className="w-6 h-6 text-primary-600" />,
      title: "Expense Tracking",
      description:
        "Easily track your income and expenses with detailed categorization.",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-primary-600" />,
      title: "Budget Management",
      description:
        "Set and monitor category-wise budgets to control your spending.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary-600" />,
      title: "Financial Insights",
      description:
        "Visualize your spending patterns with interactive charts and reports.",
    },
  ];

  return (
    <>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Take Control Of Your{" "}
          <span className="text-primary-600">Finances</span>
        </h1>
        <p className="text-lg mb-8 text-gray-600">
          Track expenses, manage budgets, and gain valuable insights into your
          spending habits with our intuitive personal finance management tool.
        </p>
        <SignedIn>
          <Link href={"/dashboard"} className="btn-primary px-8 py-4 text-lg">
            Start Tracking For Free
            <ChevronRight className="ml-2 w-5 h-5 inline-block" />
          </Link>
        </SignedIn>
      </div>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="size-12 mb-4 bg-primary-50 rounded-lg flex justify-center items-center">
                {feature.icon}
              </div>
              <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Ready to Start Managing Your Finances?
        </h2>
        <p className="text-lg mb-8 text-gray-600">
          Join thousands of users who are already tracking their finances
          effectively with FinTrack.
        </p>
        <SignedOut>
          <SignUpButton>
            <button className="btn-primary px-8 py-3 text-lg">
              Create Free Account
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
      <Footer />
    </>
  );
}
