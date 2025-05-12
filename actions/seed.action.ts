"use server";

import { prisma } from "../lib/prisma";
import { getDbUserId } from "./user.action";

export async function seedUpdateAllTransactions() {
  const userId = await getDbUserId();
  if (!userId) return;
  const accountId = "bb967cf4-cf72-44eb-8160-0e8815385d5d";
  try {
    await prisma.transaction.updateMany({
      where: {
        userId,
      },
      data: {
        accountId,
      },
    });
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account) return;
    let income = 0,
      expense = 0,
      balanceChange = account.currentBalance.toNumber();
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
      },
    });
    for (const transaction of transactions) {
      income +=
        transaction.type === "INCOME" ? transaction.amount.toNumber() : 0;
      expense +=
        transaction.type === "EXPENSE" ? transaction.amount.toNumber() : 0;
      balanceChange +=
        transaction.type === "EXPENSE"
          ? -transaction.amount.toNumber()
          : transaction.amount.toNumber();
    }
    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        currentBalance: balanceChange,
        income,
        expense,
      },
    });
    return { success: true };
  } catch (error) {
    console.log("Error in seed update  all transactions", error);
    return { success: false, error };
  }
}
