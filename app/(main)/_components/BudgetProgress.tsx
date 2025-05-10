"use client";

interface BudgetProgessProps {
  goalAmount: number;
  spentAmount: number;
}

const BudgetProgess = ({ goalAmount, spentAmount }: BudgetProgessProps) => {
  const remaining = goalAmount - spentAmount;
  const percentage = Math.min(
    Math.round((spentAmount / goalAmount) * 100),
    100
  );

  let statusColor = "bg-success-500";
  if (percentage >= 90) statusColor = "bg-warning-500";
  else if (percentage >= 75) statusColor = "bg-error-500";

  return (
    <>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">${spentAmount.toFixed(2)} spent</span>
          <span className="text-gray-900 font-medium">
            ${goalAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full">
          <div
            style={{ width: `${percentage}%` }}
            className={`h-2.5 rounded-full duration-500 transition-colors ${statusColor}`}
          />
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span
          className={`font-medium ${
            remaining >= 0 ? "text-success-600" : "text-error-600"
          }`}
        >
          {remaining >= 0
            ? `$${remaining.toFixed(2)} remaining`
            : `$${Math.abs(remaining).toFixed(2)} over budget`}
        </span>
        <span
          className={`rounded font-medium text-xs py-2 px-1 ${
            percentage >= 90
              ? "bg-error-100 text-error-800"
              : percentage >= 75
              ? "bg-warning-100 text-warning-800"
              : "bg-success-100 text-success-800"
          }`}
        >
          {percentage}%
        </span>
      </div>
    </>
  );
};

export default BudgetProgess;
