"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { SharedExpense } from "../types";
import { getDbUserId } from "./user.action";

export async function createExpense(data: Omit<SharedExpense, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const { splits, ...otherData } = data;

    const sharedExpense = await prisma.$transaction(async (tx) => {
      const expense = await prisma.expense.create({
        data: otherData,
      });

      await Promise.all(
        splits.map((s) =>
          prisma.split.create({
            data: {
              hasAlreadyPaid: otherData.userId === s.userId,
              splitAmount: s.splitAmount,
              userId: s.userId,
              expenseId: expense.id,
            },
          })
        )
      );

      return expense;
    });

    return { success: true, expense: sharedExpense };
  } catch (error) {
    console.log("Error in creating expenses", error);
    return { success: false, error };
  }
}

export async function getExpenses() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const groups = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    return groups;
  } catch (error) {
    console.log("Error in getting user expenses", error);
    throw new Error("Error getting user expenses");
  }
}
