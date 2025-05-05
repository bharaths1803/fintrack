"use server";

import { Budget, BudgetWithCategory } from "@/types";
import { getDbUserId } from "./user.action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeBudget = (obj: any) => {
  return { ...obj, amount: obj.amount.toNumber() };
};

export async function createBudget(data: Omit<BudgetWithCategory, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const budget = await prisma.budget.create({
      data: {
        userId,
        ...data,
      },
    });
    revalidatePath("/budgets");
    return { success: true, budget: serializeBudget(budget) };
  } catch (error) {
    console.log("Error crateing budget is", error);
    return { success: false, error };
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const budget = await prisma.budget.findUnique({
      where: {
        id: budgetId,
      },
    });
    if (!budget) throw new Error("Transaction not found");
    await prisma.budget.delete({
      where: {
        id: budgetId,
      },
    });
    revalidatePath("/budgets");
    return { success: true };
  } catch (error) {
    console.log("Error in delete user budget", error);
    return { success: false, error };
  }
}

export async function updateBudget(data: BudgetWithCategory) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const { id, categoryId, ...budgetData } = data;
    console.log("Data is", budgetData);
    const budget = await prisma.budget.update({
      where: {
        id,
      },
      data: budgetData,
    });

    revalidatePath("/budgets");
    return { success: true, budget: serializeBudget(budget) };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getBudgets() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

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
    console.log("Error in getting user budgets", error);
    throw new Error("Error getting user budgets");
  }
}
