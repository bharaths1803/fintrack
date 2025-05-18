import {
  getDashboardData,
  getExpensesChartData,
  getExpenseVsIncomeChartData,
  getMonthlyBudgets,
  getRecentTransactions,
} from "../../../actions/dashboard.action";
import DashboardPageClient from "./_components/DashboardPageClient";
import { getAccounts } from "../../../actions/account.action";
import { syncUser } from "../../../lib/syncUser";

const DashboardPage = async () => {
  const recentTransactions = await getRecentTransactions();
  const monthlyBudgets = await getMonthlyBudgets();
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dashboardData = await getDashboardData(month, year, null);
  const expensesChartData = await getExpensesChartData(month, year, null);
  const incomeVsExpenseData = await getExpenseVsIncomeChartData(null);
  const accounts = await getAccounts();
  const user = await syncUser();

  return (
    <DashboardPageClient
      recentTransactions={recentTransactions}
      monthlyBudgets={monthlyBudgets}
      dashboardData={dashboardData}
      expensesChartData={expensesChartData}
      incomeVsExpenseData={incomeVsExpenseData}
      accounts={accounts}
      financialJoke={user?.financialJoke || ""}
    />
  );
};

export default DashboardPage;
