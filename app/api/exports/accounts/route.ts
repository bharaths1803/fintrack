import { NextResponse } from "next/server";
import { getDbUserId } from "../../../../actions/user.action";
import { prisma } from "../../../../lib/prisma";
import ExcelJs from "exceljs";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const dbUserId = await getDbUserId();
    if (!dbUserId) throw new Error("User not found");
    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet("Accounts");

    sheet.columns = [
      { header: "Account", key: "account", width: 15 },
      { header: "Default", key: "default", width: 15 },
      { header: "Income", key: "income", width: 15 },
      { header: "Expense", key: "expense", width: 15 },
      { header: "Balance", key: "balance", width: 15 },
      { header: "N.o. of transactions", key: "transactions", width: 15 },
    ];

    const accounts = await prisma.account.findMany({
      where: {
        userId: dbUserId,
      },
      include: {
        transactions: true,
      },
    });

    accounts.forEach((a) => {
      sheet.addRow({
        account: a.accountName,
        default: a.isDefault ? "YES" : "-",
        income: a.income.toNumber(),
        expense: a.expense.toNumber(),
        balance: a.currentBalance.toNumber(),
        transactions: a.transactions.length,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=accounts.xlsx",
      },
    });
  } catch (error) {
    console.log("Error in getting accounts pdf", error);
    return NextResponse.json(
      { error: "Failed to export accounts" },
      { status: 500 }
    );
  }
}
