import { prisma } from "../prisma";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

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
