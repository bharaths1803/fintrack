import { DollarSign, Bell, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="sm:flex justify-between items-center">
          <div className="">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FinTrack</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The most comprehensive personal finance management tool that helps
              you track expenses, manage budgets, split bills, and achieve your
              financial goals.
            </p>
          </div>

          <div className="">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#howItWorks"
                  className="hover:text-white transition-colors"
                >
                  How FinTrack Works
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="hover:text-white transition-colors"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FinTrack. All rights reserved.
          </p>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>Live 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
