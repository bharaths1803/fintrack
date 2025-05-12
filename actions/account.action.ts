"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { Account } from "../types";
import { getDbUserId } from "./user.action";

const serializeAccount = (obj: any) => {
  return {
    ...obj,
    currentBalance: obj.currentBalance.toNumber(),
    income: obj.income.toNumber(),
    expense: obj.expense.toNumber(),
  };
};

export async function createAccount(data: Omit<Account, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    const account = await prisma.account.create({
      data: {
        userId,
        ...data,
        income: data.currentBalance > 0 ? data.currentBalance : 0,
        expense: data.currentBalance < 0 ? Math.abs(data.currentBalance) : 0,
      },
    });
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, account: serializeAccount(account) };
  } catch (error) {
    console.log("Error creating Account", error);
    return { success: false, error };
  }
}

export async function getAccounts() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const accounts = await prisma.account.findMany({
      where: {
        userId,
      },
    });

    const serializeAccounts = accounts.map(serializeAccount);

    return serializeAccounts;
  } catch (error) {
    console.log("Error in getting user accounts", error);
    throw new Error("Error getting user accounts");
  }
}

export async function deleteAccount(accountId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!account) throw new Error("Account not found");
    if (account.isDefault) throw new Error("Account is default");
    await prisma.account.delete({
      where: {
        id: accountId,
      },
    });
    await prisma.transaction.deleteMany({
      where: {
        accountId,
      },
    });
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.log("Error in delete user accounts", error);
    return { success: false, error };
  }
}

export async function updateAccount(data: Account) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const { id, ...accountData } = data;
    if (accountData.isDefault)
      await prisma.account.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    const account = await prisma.account.update({
      where: {
        id,
      },
      data: accountData,
    });

    revalidatePath("/accounts");
    return { success: true, transaction: serializeAccount(account) };
  } catch (error) {
    console.log("Error in updating account", error);
    return { success: false, error };
  }
}
