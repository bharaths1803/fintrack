"use server";

import { TransactionWithCategory } from "@/types";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const serializeTransaction = (obj: any) => {
  return { ...obj, amount: obj.amount.toNumber() };
};

export async function createTransaction(
  data: Omit<TransactionWithCategory, "id">
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        ...data,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      },
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true, transaction: serializeTransaction(transaction) };
  } catch (error) {
    console.log("Error creating Transactions", error);
    return { success: false, error };
  }
}

export async function getTransactions() {
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
    });

    const serializedTransactions = transactions.map((t) => ({
      ...t,
      amount: t.amount.toNumber(),
    }));

    return serializedTransactions;
  } catch (error) {
    console.log("Error in getting user transactions", error);
    throw new Error("Error getting user transactions");
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });
    if (!transaction) throw new Error("Transaction not found");
    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.log("Error in delete user transactions", error);
    return { success: false, error };
  }
}

export async function updateTransaction(data: TransactionWithCategory) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const { id, ...transactionData } = data;
    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: transactionData,
    });

    revalidatePath("/transactions");
    return { success: true, transaction: serializeTransaction(transaction) };
  } catch (error) {
    console.log("Error in updating transaction", error);
    return { success: false, error };
  }
}

function calculateNextRecurringDate(startDate: Date, interval: string) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}
