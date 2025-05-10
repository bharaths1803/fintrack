import {
  getDashboardData,
  getExpensesChartData,
  getExpenseVsIncomeChartData,
  getMonthlyBudgets,
  getRecentTransactions,
} from "../../../actions/dashboard.action";
import React from "react";
import DashboardPageClient from "./_components/DashboardPageClient";

const DashboardPage = async () => {
  const recentTransactions = await getRecentTransactions();
  const monthlyBudgets = await getMonthlyBudgets();
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dashboardData = await getDashboardData(month, year);
  const expensesChartData = await getExpensesChartData(month, year);
  const incomeVsExpenseData = await getExpenseVsIncomeChartData(month, year);

  return (
    <DashboardPageClient
      recentTransactions={recentTransactions}
      monthlyBudgets={monthlyBudgets}
      dashboardData={dashboardData}
      expensesChartData={expensesChartData}
      incomeVsExpenseData={incomeVsExpenseData}
    />
  );
};

export default DashboardPage;
