"use server";

import { TransactionWithCategory } from "../types";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    if (!data || !data.accountId)
      throw new Error("Account Required for creating transaction");
    const account = await prisma.account.findUnique({
      where: {
        id: data.accountId,
      },
    });

    if (!account) throw new Error("Account not found");

    const income =
      transaction.type === "INCOME" ? transaction.amount.toNumber() : 0;
    const expense =
      transaction.type === "EXPENSE" ? transaction.amount.toNumber() : 0;
    const balanceChange =
      account.currentBalance.toNumber() + transaction.type === "EXPENSE"
        ? -transaction.amount.toNumber()
        : transaction.amount.toNumber();

    await prisma.account.update({
      where: {
        id: data.accountId,
      },
      data: {
        currentBalance: balanceChange,
        income,
        expense,
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

    const serializedTransactions = transactions.map(serializeTransaction);

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
    if (!transaction || !transaction.accountId)
      throw new Error("Transaction not found");

    const account = await prisma.account.findUnique({
      where: {
        id: transaction.accountId,
      },
    });

    if (!account) throw new Error("Account not found");

    const income =
      account.income.toNumber() -
      (transaction.type === "INCOME" ? transaction.amount.toNumber() : 0);
    const expense =
      account.expense.toNumber() -
      (transaction.type === "EXPENSE" ? transaction.amount.toNumber() : 0);
    const balanceChange = income - expense;

    await prisma.account.update({
      where: {
        id: transaction.accountId,
      },
      data: {
        currentBalance: balanceChange,
        income,
        expense,
      },
    });

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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (!transaction || !transaction.accountId)
      throw new Error("Transaction not found");

    const updateDtransaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
        ...transactionData,
        nextRecurringDate:
          transactionData.isRecurring && transactionData.recurringInterval
            ? calculateNextRecurringDate(
                transactionData.date,
                transactionData.recurringInterval
              )
            : null,
      },
    });

    const account = await prisma.account.findUnique({
      where: {
        id: transaction.accountId,
      },
    });

    if (!account) throw new Error("Account not found");

    const changedAccountIncome =
      account.income.toNumber() -
      (transaction.type === "INCOME" ? transaction.amount.toNumber() : 0) +
      (updateDtransaction.type === "INCOME"
        ? updateDtransaction.amount.toNumber()
        : 0);

    const changedAccountExpense =
      account.expense.toNumber() -
      (transaction.type === "EXPENSE" ? transaction.amount.toNumber() : 0) +
      (updateDtransaction.type === "EXPENSE"
        ? updateDtransaction.amount.toNumber()
        : 0);

    const changedAccountBalance = changedAccountIncome - changedAccountExpense;

    await prisma.account.update({
      where: {
        id: transaction.accountId,
      },
      data: {
        income: changedAccountIncome,
        expense: changedAccountExpense,
        currentBalance: changedAccountBalance,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/accounts");

    return {
      success: true,
      transaction: serializeTransaction(updateDtransaction),
    };
  } catch (error) {
    console.log("Error in updating transaction", error);
    return { success: false, error };
  }
}

export async function scanReciept(file: File) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Type (INCOME/EXPENSE)
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "type": "string",
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: data.amount,
        date: data.date,
        description: data.description,
        type: data.type,
      };
    } catch (error) {
      console.log("Error parsing JSON response");
      throw new Error("Invalid json format from gemini");
    }
  } catch (error) {
    console.log("Error scanning reciept", error);
    throw new Error("Failed to scan reciept");
  }
}

// Utility functions

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
