import {
  BarChart,
  Bell,
  BellRing,
  Brain,
  ChevronRight,
  Link2,
  RibbonIcon,
  Scan,
  Smile,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Footer from "./_components/Footer";
import Faq from "./_components/Faq";

const features = [
  {
    icon: <BellRing className="w-6 h-6 text-primary-600" />,
    title: "Monthly Alerts",
    description:
      "Receive timely email alerts for overspending, due transactions, and budget thresholds.",
  },
  {
    icon: <Brain className="w-6 h-6 text-primary-600" />,
    title: "AI Insights",
    description:
      "Get personalized monthly financial insights and smart suggestions powered by AI.",
  },
  {
    icon: <Scan className="w-6 h-6 text-primary-600" />,
    title: "Receipt Scanning",
    description: "Scan and extract data from your receipts instantly.",
  },
  {
    icon: <Smile className="w-6 h-6 text-primary-600" />,
    title: "Financial Jokes",
    description:
      "Enjoy a lighthearted financial joke daily to make managing money a bit more fun.",
  },
  {
    icon: <Tags className="w-6 h-6 text-primary-600" />,
    title: "Custom Categories",
    description:
      "Create and manage custom income and expense categories tailored to your needs.",
  },
  {
    icon: <Link2 className="w-6 h-6 text-primary-600" />,
    title: "Account Linking",
    description:
      "Manage multiple accounts and get a consolidated view of your financial activity.",
  },
];

const whyFintrack = [
  {
    icon: <BarChart className="w-6 h-6 text-primary-600" />,
    title: "Personalized Insights",
    description: "See where your money goes every month.",
  },
  {
    icon: <Bell className="w-6 h-6 text-primary-600" />,
    title: "Smart Alerts",
    description: "Never miss a bill or budget threshold again.",
  },
  {
    icon: <RibbonIcon className="w-6 h-6 text-primary-600" />,
    title: "AI powered",
    description: "Financial reports & fun jokes crafted by AI.",
  },
];

export default function Home() {
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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 text-center">
          Why <span className="text-primary-600">Fintrack</span>?
        </h1>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyFintrack.map((feature, idx) => (
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
      </div>
      <Faq />
      <Footer />
    </>
  );
}
