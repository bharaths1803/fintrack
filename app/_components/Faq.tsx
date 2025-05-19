"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

const faqs = [
  {
    question: "Is FinTrack free to use?",
    answer:
      "Yes, FinTrack offers a free plan with all essential features. Premium features are available for power users.",
  },
  {
    question: "How does FinTrack help me manage my spending?",
    answer:
      "FinTrack lets you create monthly budgets, tracks your income and expenses in real-time, and sends alerts when you’re close to overspending.",
  },
  {
    question: "What are AI Insights and how do they work?",
    answer:
      "AI Insights analyze your financial habits and generate personalized monthly reports with tips, trends, and key takeaways to improve your financial health.",
  },
  {
    question: "Can I scan receipts to log transactions?",
    answer:
      "Yes! FinTrack includes AI-powered receipt scanning that reads and adds transaction details like amount and vendor directly from your receipts.",
  },
  {
    question: "Will I get reminders for due or upcoming transactions?",
    answer:
      "Absolutely. FinTrack sends email reminders for due transactions to help you stay on top of bills and avoid late fees.",
  },
];

const Faq = () => {
  const [viewAnswerIds, setViewAnswerIds] = useState<number[]>([]);

  const isPartOfViewAnswers = (idx: number) => {
    return viewAnswerIds.includes(idx);
  };

  const handleToggleViewAnswer = (idx: number) => {
    if (isPartOfViewAnswers(idx))
      setViewAnswerIds(viewAnswerIds.filter((id) => id !== idx));
    else setViewAnswerIds([...viewAnswerIds, idx]);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Got questions? We've got answers
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isViewingAnswer = isPartOfViewAnswers(idx);
              return (
                <div
                  className="bg-white border border-gray-100 shadow-sm p-6 rounded-lg"
                  key={idx}
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg text-gray-900 font-semibold mb-2">
                      {faq.question}
                    </h3>
                    <button onClick={() => handleToggleViewAnswer(idx)}>
                      {isViewingAnswer ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                  {isViewingAnswer && (
                    <p className="text-gray-900">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
