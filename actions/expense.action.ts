"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { SharedExpense } from "../types";
import { getDbUserId } from "./user.action";

const serializeTransaction = (obj: any) => {
  return { ...obj, amount: obj.amount.toNumber() };
};

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

    return { success: true, expense: serializeTransaction(sharedExpense) };
  } catch (error) {
    console.log("Error in creating expenses", error);
    return { success: false, error };
  }
}

export async function getExpensesBetweenUsers(otherUserId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return;

    let bothExpenses = await prisma.expense.findMany({
      where: {
        AND: [
          {
            OR: [{ userId: otherUserId }, { userId: currentUserId }],
          },
          {
            groupId: null,
          },
        ],
      },
      include: {
        splits: {
          select: {
            userId: true,
            hasAlreadyPaid: true,
            splitAmount: true,
          },
        },
      },
    });

    bothExpenses = bothExpenses.filter((e) => {
      const isMePartOfSplits = e.splits.some((s) => s.userId === currentUserId);
      const isOtherUserPartOfSplits = e.splits.some(
        (s) => s.userId === otherUserId
      );
      return isMePartOfSplits && isOtherUserPartOfSplits;
    });

    let balance = 0,
      totalExpenses = 0;

    bothExpenses.forEach((e) => {
      if (e.userId === currentUserId) {
        const otherUserOweMeMoney = e.splits.find(
          (s) => s.userId === otherUserId && !s.hasAlreadyPaid
        );
        if (otherUserOweMeMoney)
          balance += otherUserOweMeMoney.splitAmount.toNumber();
        totalExpenses += e.amount.toNumber();
      } else {
        const IOweOtherUserMoney = e.splits.find(
          (s) => s.userId === currentUserId && !s.hasAlreadyPaid
        );
        if (IOweOtherUserMoney)
          balance -= IOweOtherUserMoney.splitAmount.toNumber();
        totalExpenses += e.amount.toNumber();
      }
    });

    bothExpenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const bothExpensesMapped = bothExpenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
      splits: e.splits.map((s) => ({
        ...s,
        splitAmount: Number(s.splitAmount),
      })),
    }));

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        name: true,
        profilePicUrl: true,
        email: true,
      },
    });

    const settlements = await prisma.settlements.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                sentUserId: currentUserId,
              },
              {
                receivedUserId: otherUserId,
              },
            ],
          },
          {
            AND: [
              {
                sentUserId: otherUserId,
              },
              {
                receivedUserId: currentUserId,
              },
            ],
          },
        ],
      },
    });

    settlements.forEach((s) => {
      if (s.sentUserId === currentUserId) balance += s.amount.toNumber();
      else balance -= s.amount.toNumber();
    });

    settlements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const settlementsMapped = settlements.map((s) => ({
      ...s,
      amount: Number(s.amount),
    }));

    return {
      expenses: bothExpensesMapped,
      settlements: settlementsMapped,
      otherUser,
      balance,
      totalExpenses,
    };
  } catch (error) {
    console.log("Error in getting user expenses", error);
    throw new Error("Error getting user expenses");
  }
}
