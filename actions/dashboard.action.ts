"use server";

import { prisma } from "../lib/prisma";
import { getDbUserId } from "./user.action";

const serializeTransaction = (obj: any) => {
  return { ...obj, amount: obj.amount.toNumber() };
};

export async function getRecentTransactions() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            type: true,
            name: true,
            iconUrl: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    });

    const serializedTransactions = transactions.map((t) => ({
      ...t,
      amount: t.amount.toNumber(),
    }));

    return serializedTransactions;
  } catch (error) {
    console.log("Error in getting recent user transactions", error);
    throw new Error("Error getting recent user transactions");
  }
}

export async function getMonthlyBudgets() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
      },
      select: {
        amount: true,
        date: true,
        categoryId: true,
      },
    });

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: true,
      },
    });

    const budgetSums = budgets.map((budget) => {
      const totalSpent = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);

          return (
            tx.categoryId === budget.categoryId &&
            txDate.getMonth() === budget.month &&
            txDate.getFullYear() === budget.year
          );
        })
        .reduce((s, tx) => s + Number(tx.amount), 0);
      return {
        ...budget,
        amount: budget.amount.toNumber(),
        totalSpent,
      };
    });

    return budgetSums;
  } catch (error) {
    console.log("Error in getting monthly user budgets", error);
    throw new Error("Error getting monthly user budgets");
  }
}

export async function getDashboardData(month: number = -1, year: number = -1) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    let income = 0,
      expense = 0;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (month == -1) {
        if (date.getFullYear() == year) {
          if (t.type === "EXPENSE") expense += Number(t.amount);
          else income += Number(t.amount);
        }
      } else {
        if (date.getFullYear() == year && date.getMonth() == month) {
          if (t.type === "EXPENSE") expense += Number(t.amount);
          else income += Number(t.amount);
        }
      }
    });

    const balance = income - expense;

    return {
      income,
      expense,
      balance,
    };
  } catch (error) {
    console.log("Error in getting dashboard data", error);
    throw new Error("Error dashboard data");
  }
}

export async function getExpensesChartData(
  month: number = -1,
  year: number = -1
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
        type: true,
        date: true,
        category: true,
      },
    });

    let expenses: { [key: string]: number } = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (month == -1) {
        if (date.getFullYear() == year && t.type === "EXPENSE") {
          if (expenses[t.category.name])
            expenses[t.category.name] += Number(t.amount);
          else expenses[t.category.name] = Number(t.amount);
        }
      } else {
        if (
          date.getFullYear() == year &&
          date.getMonth() == month &&
          t.type === "EXPENSE"
        ) {
          if (expenses[t.category.name])
            expenses[t.category.name] += Number(t.amount);
          else expenses[t.category.name] = Number(t.amount);
        }
      }
    });
    return Object.entries(expenses).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.log("Error in getting expenses chart data", error);
    throw new Error("Error expenses chart data");
  }
}

export async function getExpenseVsIncomeChartData(
  month: number = -1,
  year: number = -1
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    let dataMap: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const k = `${date.getFullYear()}-${date.getMonth()}`;
      if (!dataMap[k]) {
        dataMap[k] = { income: 0, expense: 0 };
      }
      if (t.type === "INCOME") dataMap[k].income += Number(t.amount);
      else dataMap[k].expense += Number(t.amount);
    });
    return Object.entries(dataMap).map(([name, value]) => {
      const [year, month] = name.split("-").map(Number);
      const monthName = new Date(year, month).toLocaleString("default", {
        month: "short",
      });
      return {
        name: `${monthName} ${year}`,
        income: value.income.toFixed(2),
        expense: value.expense.toFixed(2),
      };
    });
  } catch (error) {
    console.log("Error in getting incomes vs expenses chart data", error);
    throw new Error("Error incomes vs expenses chart data");
  }
}
