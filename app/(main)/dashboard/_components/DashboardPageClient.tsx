"use client";

import { getCategories } from "../../../../actions/categories.action";
import {
  getDashboardData,
  getExpensesChartData,
  getExpenseVsIncomeChartData,
  getMonthlyBudgets,
  getRecentTransactions,
} from "../../../../actions/dashboard.action";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChartIcon,
  DollarSign,
  PieChartIcon,
  Repeat,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import BudgetProgess from "../../_components/BudgetProgress";
import { useEffect, useState } from "react";
import { COLORS, monthOptions } from "../../../../data";
import { FilterOptionsDashboardData } from "../../../../types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";

type RecentTransactions = Awaited<ReturnType<typeof getRecentTransactions>>;
type MonthlyBudgets = Awaited<ReturnType<typeof getMonthlyBudgets>>;
type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
type ExpensesChartData = Awaited<ReturnType<typeof getExpensesChartData>>;
type IncomeVsExpenseData = Awaited<
  ReturnType<typeof getExpenseVsIncomeChartData>
>;

interface DashboardPageClientProps {
  recentTransactions: RecentTransactions;
  monthlyBudgets: MonthlyBudgets;
  dashboardData: DashboardData;
  expensesChartData: ExpensesChartData;
  incomeVsExpenseData: IncomeVsExpenseData;
}

const DashboardPageClient = ({
  recentTransactions,
  monthlyBudgets,
  dashboardData,
  expensesChartData,
  incomeVsExpenseData,
}: DashboardPageClientProps) => {
  const [dataFilterType, setDataFilterType] = useState<string>("MONTHLY");
  const [dashboardDataLocal, setDashboardDataLocal] =
    useState<DashboardData>(dashboardData);
  const [expensesChartDataLocal, setExpensesChartDataLocal] =
    useState<ExpensesChartData>(expensesChartData);

  const [dataFilterOptions, setDataFilterOptions] =
    useState<FilterOptionsDashboardData>({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });

  const handleFilterChange = (
    field: keyof FilterOptionsDashboardData,
    value: any
  ) => {
    setDataFilterOptions((prev) => ({ ...prev, [field]: value }));
  };

  const currYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      if (dataFilterType == "MONTHLY") {
        const res1 = await getDashboardData(
          dataFilterOptions.month,
          dataFilterOptions.year
        );
        const res2 = await getExpensesChartData(
          dataFilterOptions.month,
          dataFilterOptions.year
        );
        setDashboardDataLocal(res1);
        setExpensesChartDataLocal(res2);
      } else {
        const res1 = await getDashboardData(-1, dataFilterOptions.year);
        const res2 = await getExpensesChartData(-1, dataFilterOptions.year);
        setDashboardDataLocal(res1);
        setExpensesChartDataLocal(res2);
      }
    };
    fetchData();
  }, [dataFilterOptions.month, dataFilterOptions.year, dataFilterType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 sm:mt-0">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </div>

      {/* Data Filtering */}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="filterType"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Filter Type
            </label>
            <select
              id="filterType"
              name="filterType"
              value={dataFilterType}
              onChange={(e) => setDataFilterType(e.target.value)}
              className={`input`}
            >
              <option value={"MONTHLY"}>MONTHLY</option>
              <option value={"YEARLY"}>YEARLY</option>
            </select>
          </div>
          {dataFilterType === "MONTHLY" && (
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Month
              </label>
              <select
                id="month"
                name="month"
                value={dataFilterOptions.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                className={`input`}
              >
                {monthOptions.map((month) => (
                  <option value={month.value} key={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Year
            </label>
            <select
              id="year"
              name="year"
              value={dataFilterOptions.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className={`input`}
            >
              <option value={currYear - 1}>{currYear - 1}</option>
              <option value={currYear}>{currYear}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-50 text-primary-700">
              <DollarSign size={24} />
            </div>
            <div className="ml-4">
              <h2 className="font-medium text-gray-500 text-sm">
                Current Balance
              </h2>
              <p className="font-semibold text-gray-900 text-2xl">
                ${dashboardDataLocal?.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-success-50 text-success-700">
              <ArrowUpRight size={24} />
            </div>
            <div className="ml-4">
              <h2 className="font-medium text-gray-500 text-sm">
                Total Income
              </h2>
              <p className="font-semibold text-success-600 text-2xl">
                ${dashboardDataLocal?.income.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-error-50 text-error-700">
              <ArrowDownRight size={24} />
            </div>
            <div className="ml-4">
              <h2 className="font-medium text-gray-500 text-sm">
                Total Expense
              </h2>
              <p className="font-semibold text-error-900 text-2xl">
                ${dashboardDataLocal?.expense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expenses Breakdown */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-medium text-lg text-gray-900">
              Expense Breakdown
            </h2>
            <div className="p-1.5 rounded-full bg-gray-100">
              <PieChartIcon size={18} className="text-gray-900" />
            </div>
          </div>
          {expensesChartDataLocal && (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesChartDataLocal}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesChartDataLocal.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Incomes Vs Expenses Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-medium text-lg text-gray-900">
              Incomes Vs Expenses
            </h2>
            <div className="p-1.5 rounded-full bg-gray-100">
              <BarChartIcon size={18} className="text-gray-900" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsExpenseData}
                margin={{ top: 20, right: 30, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Transactions
          </h2>
          <Link
            href={"/transactions"}
            className="btn-outline flex items-center px-3 py-1 text-xs"
          >
            <TrendingUp size={18} className="mr-1" />
            View All
          </Link>
        </div>

        {recentTransactions?.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="py-8 text-center">
              <p className="text-gray-500">No Transactions found</p>
              <Link className="btn-primary mt-4" href={"/transactions"}>
                Add your first transaction
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Recurring
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions?.map((transaction, idx) => (
                    <tr
                      className="hover:bg-gray-50 transition-colors"
                      key={idx}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {transaction.note}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {transaction.category.iconUrl}{" "}
                        {transaction.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div
                          className={`flex items-center ${
                            transaction.type === "INCOME"
                              ? "text-success-600"
                              : "text-error-600"
                          }`}
                        >
                          {transaction.type === "INCOME" ? (
                            <ArrowUpRight size={16} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={16} className="mr-1" />
                          )}
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap`}
                      >
                        {transaction.isRecurring ? (
                          <div className="flex items-center text-primary-600">
                            <Repeat className="mr-2" size={16} />
                            <span className="capitalize">
                              {transaction.recurringInterval}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 w-full pl-7">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Budgets */}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-950">Monthly Budgets</h2>
          <Link
            href={"/transactions"}
            className="btn-outline flex items-center px-3 py-1 text-xs"
          >
            <TrendingUp size={18} className="mr-1" />
            View All
          </Link>
        </div>

        {monthlyBudgets?.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="py-8 text-center">
              <p className="text-gray-500">No budgets found</p>
              <Link className="btn-primary mt-4" href={"/budgets"}>
                Add your first budget
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyBudgets?.map((budget, idx) => (
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                key={idx}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-2xl">{budget.category?.iconUrl}</span>
                    <h3 className="font-medium text-gray-900">
                      {budget.category?.name}
                    </h3>
                  </div>
                </div>
                <BudgetProgess
                  goalAmount={budget.amount}
                  spentAmount={budget.totalSpent}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPageClient;
