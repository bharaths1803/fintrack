import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendEmail } from "../../actions/emails.action";
import EmailTemplate from "../../emails/Template";
import { prisma } from "../prisma";
import { inngest } from "./client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Hello World Sample Function

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

// Recurring Transactions

export const processRecurringTransactions = inngest.createFunction(
  {
    id: "process-recurring-transactions",
    name: "Process Recurring Transactions",
    throttle: {
      limit: 10,
      key: "event.data.userId",
      period: "1m",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.log("Inavlid event data");
      return { error: "Invalid event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await prisma.transaction.findUnique({
        where: {
          userId: event.data.userId,
          id: event.data.transactionId,
        },
      });

      if (!transaction || !transaction.nextRecurringDate) return;

      const today = new Date();
      const nextRecurringDate = new Date(transaction.nextRecurringDate);

      if (nextRecurringDate > today) return;

      await prisma.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            note: `${transaction.note} (Recurring)`,
            date: new Date(),
            isRecurring: false,
            userId: transaction.userId,
            categoryId: transaction.categoryId,
            isCompleted: transaction.isCompleted,
            reminderDays: transaction.reminderDays,
          },
        });

        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            lastProcessedDate: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval || ""
            ),
          },
        });
      });
    });
  }
);

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await prisma.transaction.findMany({
          where: {
            isRecurring: true,
            OR: [
              { lastProcessedDate: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    const events = recurringTransactions.map((transaction) => ({
      name: "transaction.recurring.process",
      data: {
        userId: transaction.userId,
        transactionId: transaction.id,
      },
    }));

    await inngest.send(events);

    return { triggered: recurringTransactions.length };
  }
);

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

// Due Transactions Reminder

export const generateDueReminders = inngest.createFunction(
  {
    id: "generate-due-reminders",
    name: "Generate Due Reminders",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const users = await prisma.user.findMany({
      include: {
        transactions: {
          include: {
            category: true,
          },
        },
      },
    });

    for (const user of users) {
      await step.run(`generate-due-reminders-${user.id}`, async () => {
        const dueTransactions = user.transactions.filter(
          (transaction) => !transaction.isCompleted
        );

        const filtereddueTransactions = dueTransactions.filter(
          (transaction) => {
            const today = new Date();
            const dueDate = new Date(transaction.date);
            const remainingDaysFromDue = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            return remainingDaysFromDue == transaction.reminderDays;
          }
        );

        const dueFromTodayTransactions = filtereddueTransactions.map(
          (transaction) => ({
            categoryName: transaction.category.name,
            amount: Number(transaction.amount),
            text: calculateDueText(transaction.reminderDays || 0),
          })
        );

        if (dueFromTodayTransactions && dueFromTodayTransactions.length > 0)
          await sendEmail({
            to: user.email,
            subject: "Upcoming Transactions Reminder",
            react: EmailTemplate({
              userName: user.name,
              data: dueFromTodayTransactions,
              type: "due-reminders",
            }),
          });
      });
    }

    return { processed: users.length };
  }
);

function calculateDueText(days: number) {
  let ans = "Due ";
  if (days == 0) ans += "today";
  else if (days == 1) ans += "tommorrow";
  else ans += `in ${days} days`;
  return ans;
}

// Monthly Budget Alerts

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-budget-alert",
    name: "Generate Budget Alert",
  },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    const today = new Date();
    const users = await prisma.user.findMany({
      include: {
        budgets: {
          where: {
            month: today.getMonth(),
            year: today.getFullYear(),
          },
          include: {
            category: true,
          },
        },
        transactions: {
          where: {
            type: "EXPENSE",
          },
          select: {
            amount: true,
            date: true,
            categoryId: true,
          },
        },
      },
    });

    for (const user of users) {
      await step.run(`generate-budget-alert-${user.id}`, async () => {
        let budgetSums = user.budgets.map((budget) => {
          const totalSpent = user.transactions
            .filter((tx) => {
              const txDate = new Date(tx.date);
              return (
                tx.categoryId === budget.categoryId &&
                txDate.getFullYear() === budget.year &&
                txDate.getMonth() === budget.month
              );
            })
            .reduce((s, tx) => s + Number(tx.amount), 0);

          const remaining = budget.amount.toNumber() - totalSpent;
          const percentageSpent = Math.min(
            Math.round((totalSpent / budget.amount.toNumber()) * 100),
            100
          );

          return {
            budgetId: budget.id,
            category: budget.category?.name,
            totalSpent,
            amount: budget.amount.toNumber(),
            percentageSpent,
            remaining,
            lastAlertSent: budget.lastAlertSent,
          };
        });

        budgetSums = budgetSums.filter((b) => {
          const lastAlertSentDate = new Date(b.lastAlertSent || "");
          return (
            b.percentageSpent >= 90 &&
            (!b.lastAlertSent ||
              lastAlertSentDate.getFullYear() !== today.getFullYear() ||
              lastAlertSentDate.getMonth() !== today.getMonth())
          );
        });

        if (budgetSums && budgetSums.length > 0)
          await sendEmail({
            to: user.email,
            subject: "Monthly Budgets Alert",
            react: EmailTemplate({
              userName: user.name,
              data: budgetSums,
              type: "budgets-alert",
            }),
          });

        budgetSums.forEach(async (b) => {
          await prisma.budget.update({
            where: {
              id: b.budgetId,
            },
            data: {
              lastAlertSent: today,
            },
          });
        });
      });
    }
  }
);

// Generate Financial Jokes

export const generateFinancialJokes = inngest.createFunction(
  {
    id: "generate-financial-jokes",
    name: "Generate Financial Jokes",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const users = await prisma.user.findMany({});

    for (const user of users) {
      await step.run(`generate-financial-jokes-${user.id}`, async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Give a unique joke related to managing personal finances in 2 or 3 lines in string format without any qoutes(just plain string, e.g. I am a boy).`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            financialJoke: cleanedText,
          },
        });
      });
    }

    return { processed: users.length };
  }
);
