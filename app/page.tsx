import {
  BarChart2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Globe,
  Play,
  Shield,
  Smartphone,
  Tags,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SignedOut } from "@clerk/nextjs";
import Footer from "./_components/Footer";
import Faq from "./_components/Faq";

const features = [
  {
    icon: <Wallet className="w-8 h-8 text-primary-600" />,
    title: "Multi-Account Management",
    description:
      "Manage checking, savings, credit cards, and investment accounts all in one place with real-time balance tracking.",
    highlight: "Track unlimited accounts",
  },
  {
    icon: <Tags className="w-8 h-8 text-secondary-600" />,
    title: "Smart Categorization",
    description:
      "Organize transactions with custom categories, emoji icons, and intelligent auto-categorization for faster tracking.",
    highlight: "Custom emoji categories",
  },
  {
    icon: <Target className="w-8 h-8 text-accent-600" />,
    title: "Advanced Budgeting",
    description:
      "Set monthly budgets, track spending in real-time, and get alerts when approaching limits with visual progress indicators.",
    highlight: "Real-time budget monitoring",
  },
  {
    icon: <Users className="w-8 h-8 text-success-600" />,
    title: "Group Expense Management",
    description:
      "Split bills with friends and family, track shared expenses, manage settlements, and keep everyone accountable.",
    highlight: "Split bills effortlessly",
  },
  {
    icon: <Calendar className="w-8 h-8 text-warning-600" />,
    title: "Recurring Transactions",
    description:
      "Automate recurring income and expenses with smart reminders for upcoming bills and subscription management.",
    highlight: "Never miss a payment",
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-error-600" />,
    title: "Financial Analytics",
    description:
      "Gain insights with interactive charts, spending trends, category breakdowns, and comprehensive financial reports.",
    highlight: "Data-driven insights",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Set Up Your Financial Foundation",
    description:
      "Create your account and add all your financial accounts - checking, savings, credit cards, and more. Customize categories with emoji icons to match your lifestyle.",
  },
  {
    step: 2,
    icon: <DollarSign className="w-6 h-6" />,
    title: "Track Every Transaction",
    description:
      "Record income and expenses with smart categorization. Set up recurring transactions for bills and subscriptions with automated reminders.",
  },
  {
    step: 3,
    icon: <Target className="w-6 h-6" />,
    title: "Create Smart Budgets",
    description:
      "Set monthly budgets for each category with real-time monitoring. Get visual progress indicators and alerts when approaching limits.",
  },
  {
    step: 4,
    icon: <Users className="w-6 h-6" />,
    title: "Manage Shared Expenses",
    description:
      "Create groups for shared expenses, split bills with custom ratios, track who owes what, and manage settlements seamlessly.",
  },
  {
    step: 5,
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Analyze Your Finances",
    description:
      "View interactive charts showing spending patterns, income vs expenses, category breakdowns, and monthly trends.",
  },
  {
    step: 6,
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Achieve Financial Goals",
    description:
      "Use insights to make informed decisions, identify saving opportunities, and build better money habits for long-term success.",
  },
];

const testimonials = [
  {
    name: "Prabhu R",
    quote:
      "This finance tracker has completely changed the way I manage my money. The clean UI, smart budgeting tools, and real-time expense tracking make it super easy to stay on top of my finances",
  },
  {
    name: "Achudhan",
    quote:
      "Fintrack is a clean, intuitive financial tracking web app with a smooth user experience. The UI is minimal and user-friendly, making it easy to log and categorize expenses",
  },
  {
    name: "Sandeep",
    quote: "Looks awesome✨✨✨✨✨✨",
  },
];

const pricingFeatures = [
  "Unlimited accounts and transactions",
  "Advanced budgeting and analytics",
  "Group expense management",
  "Recurring transaction automation",
  "Data export and backup",
  "Monthly budget alerts",
];

export default function Home() {
  return (
    <>
      {/* Intro */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-36 text-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex justify-center items-center rounded-full px-4 py-2 bg-primary-100 text-primary-700 text-sm font-medium">
            <Zap className="h-4 w-4 mr-2" />
            Complete Personal Finance Management
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master your money with{" "}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Finances
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl leading-relaxed mx-auto">
            The most comprehensive personal finance app that tracks expenses
            across multiple accounts, manages budgets intelligently, splits
            bills with friends, and provides powerful analytics to help you
            achieve your financial goals.
          </p>
          <SignedOut>
            <div className="flex flex-col sm:flex-row justify-center items-center mb-12 gap-4">
              <Link
                href={"/signup"}
                className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl"
              >
                Start Tracking For Free
                <ChevronRight className="ml-2 w-5 h-5 inline-block" />
              </Link>
              <button className="inline-flex items-center justify-center bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* Features */}
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl bg-white pb-32 pt-20"
        id="features"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Finances
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            From basic expense tracking to advanced group expense management,
            FinTrack provides all the tools you need in one beautiful, intuitive
            interface.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="size-16 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl transition-transform group-hover:scale-110 flex justify-center items-center ">
                {feature.icon}
              </div>
              <div className="inline-flex items-center px-3 py-1 mb-4 text-sm font-medium bg-primary-50 text-primary-600">
                {feature.highlight}
              </div>
              <h3 className="text-xl text-gray-900 font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works? */}
      <div
        className="px-4 sm:px-6 lg:px-8 pt-20 pb-32 bg-gray-50"
        id="howItWorks"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How FinTrack Works
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w- mx-auto">
              Master your finances in six comprehensive steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((point, idx) => (
              <div
                key={idx}
                className="p-8 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex items-center mb-6">
                  <div className="size-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex justify-center items-center text-white text-lg mr-4 font-bold">
                    {point.step}
                  </div>
                  <div className="size-10 bg-primary-50 rounded-lg  flex justify-center items-center text-primary-600">
                    {point.icon}
                  </div>
                </div>

                <h3 className="text-xl text-gray-900 font-semibold mb-4">
                  {point.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}

      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-32" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by our Users
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w- mx-auto">
              See what our users say about their FinTrack experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm"
              >
                <h4 className="text-lg text-gray-900 font-semibold">
                  {testimonial.name}
                </h4>
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Free Pricing Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-32 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Everything you need to master your finances, completely free
            </p>
          </div>
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Free Forever
              </h3>
              <div className="text-6xl font-bold text-primary-600 mb-2">$0</div>
              <p className="text-gray-600">
                No hidden fees, no credit card required
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 mb-8 gap-4">
              {pricingFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center">
                  <Check className="text-success-500 size-5 mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA  */}

      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-32 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join thousands of users who are already managing their money
              smarter with FinTrack's comprehensive suite of financial tools.
            </p>
          </div>
          <SignedOut>
            <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-4">
              <Link
                href={"/signup"}
                className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl"
              >
                Signup
              </Link>
              <Link
                href={"/signin"}
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Login
              </Link>
            </div>
          </SignedOut>
          <div className="mt-12 flex items-center justify-center space-x-8 text-primary-100">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Clerk-level Security</span>
            </div>
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              <span>Mobile Ready</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              <span>Available Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      <Faq />
      <Footer />
    </>
  );
}
