import { NextResponse } from "next/server";
import { getDbUserId } from "../../../../actions/user.action";
import { prisma } from "../../../../lib/prisma";
import ExcelJs from "exceljs";
import { TransactionWithCategory } from "../../../../types";
import { addDays } from "date-fns";

const getDueStatus = (transaction: TransactionWithCategory) => {
  if (transaction.isCompleted) return;

  const dueDate = new Date(transaction.date);
  const today = new Date();
  const reminderDate = addDays(dueDate, -transaction.reminderDays!);
  if (dueDate < today) return { type: "overdue", text: "Overdue" };
  else if (reminderDate <= today) {
    const daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    console.log(transaction.amount, daysLeft);
    return {
      type: "due-soon",
      text: `Due in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
    };
  } else return null;
};

export async function POST(req: Request) {
  const filterOptions = await req.json();
  try {
    const dbUserId = await getDbUserId();
    if (!dbUserId) throw new Error("User not found");
    let transactions = await prisma.transaction.findMany({
      where: {
        userId: dbUserId,
      },
      include: {
        category: {
          select: {
            name: true,
            iconUrl: true,
          },
        },
        account: {
          select: {
            accountName: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (filterOptions.searchTerm) {
      const searchTermLower = filterOptions.searchTerm.toLowerCase();
      transactions = transactions?.filter((t) =>
        t.note.toLowerCase().includes(searchTermLower)
      );
    }
    if (filterOptions.startDate) {
      const start = new Date(filterOptions.startDate);
      transactions = transactions?.filter((t) => new Date(t.date) >= start);
    }
    if (filterOptions.endDate) {
      const end = new Date(filterOptions.endDate);
      end.setDate(end.getDate() + 1);
      transactions = transactions?.filter((t) => new Date(t.date) <= end);
    }
    if (filterOptions.type !== "ALL") {
      transactions = transactions?.filter((t) => t.type === filterOptions.type);
    }
    if (filterOptions.categoryId && filterOptions.categoryId !== "ALL") {
      console.log("Category id filteroptions", filterOptions.categoryId);
      transactions = transactions?.filter(
        (t) => t.categoryId === filterOptions.categoryId
      );
    }
    if (filterOptions.accountId && filterOptions.accountId !== "ALL") {
      transactions = transactions?.filter(
        (t) => t.accountId === filterOptions.accountId
      );
    }

    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet("Transactions");

    sheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Description", key: "note", width: 15 },
      { header: "Account", key: "account", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Recurring", key: "recurring", width: 15 },
      { header: "Status", key: "transactionstatus", width: 15 },
    ];

    transactions.forEach((t) => {
      const dueStatus = getDueStatus({ ...t, amount: t.amount.toNumber() });
      sheet.addRow({
        date: new Date(t.date).toLocaleString(),
        note: t.note,
        account: t.account?.accountName,
        category: t.category.name,
        amount:
          t.type === "EXPENSE" ? -t.amount.toNumber() : t.amount.toNumber(),
        recurring: t.isRecurring ? t.recurringInterval : "-",
        transactionstatus: t.isCompleted
          ? "Completed"
          : dueStatus
            ? dueStatus.text
            : "Pending",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=transactions.xlsx",
      },
    });
  } catch (error) {
    console.log("Error in getting transactions pdf", error);
    return NextResponse.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}
