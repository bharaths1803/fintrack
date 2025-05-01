import React from "react";

const BudgetLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="pt-20 flex items-center justify-center">{children}</div>
  );
};

export default BudgetLayout;
