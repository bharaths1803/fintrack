import { sendEmail } from "../../actions/emails.action";
import EmailTemplate from "../../emails/Template";
import { prisma } from "../prisma";
import { inngest } from "./client";

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

        await sendEmail({
          to: user.email,
          subject: "Upcoming Transactions Reminder",
          react: EmailTemplate({
            userName: user.name,
            data: dueFromTodayTransactions,
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
