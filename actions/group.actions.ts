"use server";

import { revalidatePath } from "next/cache";
import { Group, Member } from "../types";
import { getDbUserId } from "./user.action";
import { prisma } from "../lib/prisma";

export async function createGroup(data: Omit<Group, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    let { selectedMembers, ...otherData } = data;
    const user = {
      id: userId,
      name: "",
      profilePicUrl: "",
    };
    selectedMembers = [...selectedMembers, user];
    const group = await prisma.group.create({
      data: {
        ...otherData,
        members: {
          connect: selectedMembers.map((member) => ({ id: member.id })),
        },
        adminId: userId,
      },
    });
    console.log("Group", group);
    revalidatePath("/contacts");
    return { success: true, group };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getGroupExpenses(groupId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return;

    const expenses = await prisma.expense.findMany({
      where: {
        groupId,
      },
      include: {
        splits: {
          select: {
            userId: true,
            hasAlreadyPaid: true,
            splitAmount: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        paidByUser: {
          select: {
            name: true,
          },
        },
      },
    });

    const settlements = await prisma.settlements.findMany({
      where: {
        groupId,
      },
    });

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        members: {
          select: {
            id: true,
            name: true,
            profilePicUrl: true,
            email: true,
          },
        },
        adminId: true,
      },
    });

    const groupMembers = group?.members;

    const transactionsOwedFromTo: {
      [key: string]: {
        [key: string]: number;
      };
    } = {};

    groupMembers?.forEach((m1) => {
      transactionsOwedFromTo[m1.id] = {};
      groupMembers.forEach((m2) => {
        if (m1.id !== m2.id) transactionsOwedFromTo[m1.id][m2.id] = 0;
      });
    });

    let totalExpenses = 0,
      totalSettlements = 0;

    const netBalances: { [key: string]: number } = {};

    expenses.forEach((e) => {
      const paidUserId = e.userId;
      totalExpenses += e.amount.toNumber();
      e.splits.forEach((s) => {
        if (!s.hasAlreadyPaid && s.userId !== paidUserId) {
          transactionsOwedFromTo[s.userId][paidUserId] +=
            s.splitAmount.toNumber();
          if (!netBalances[paidUserId]) netBalances[paidUserId] = 0;
          if (!netBalances[s.userId]) netBalances[s.userId] = 0;
          netBalances[paidUserId] += s.splitAmount.toNumber();
          netBalances[s.userId] -= s.splitAmount.toNumber();
        }
      });
    });

    settlements.forEach((s) => {
      transactionsOwedFromTo[s.sentUserId][s.receivedUserId] -=
        s.amount.toNumber();

      netBalances[s.sentUserId] += s.amount.toNumber();
      netBalances[s.receivedUserId] -= s.amount.toNumber();

      totalSettlements += s.amount.toNumber();
    });

    const n: number = groupMembers?.length || 0;

    for (let i = 0; i < n; ++i) {
      const a = groupMembers?.[i].id || "";
      for (let j = i + 1; j < n; ++j) {
        const b = groupMembers?.[j].id || "";
        const diff =
          transactionsOwedFromTo[a][b] - transactionsOwedFromTo[b][a];
        if (diff > 0) {
          transactionsOwedFromTo[a][b] = diff;
          transactionsOwedFromTo[b][a] = 0;
        } else if (diff < 0) {
          transactionsOwedFromTo[a][b] = 0;
          transactionsOwedFromTo[b][a] = Math.abs(diff);
        } else {
          transactionsOwedFromTo[a][b] = 0;
          transactionsOwedFromTo[b][a] = 0;
        }
      }
    }

    const allMembersBalances = groupMembers?.map((m) => ({
      ...m,
      owesTo: Object.entries(transactionsOwedFromTo[m.id])
        .filter(([owesToId, owesToAmount]) => owesToAmount > 0)
        .map(([owesToId, owesToAmount]) => ({ owesToId, owesToAmount })),
      owesFrom: groupMembers
        .filter(
          (owesFromMember) =>
            transactionsOwedFromTo[owesFromMember.id][m.id] > 0
        )
        .map((owesFromMember) => ({
          owesFromId: owesFromMember.id,
          owesFromAmount: transactionsOwedFromTo[owesFromMember.id][m.id],
        })),
    }));

    const settlementsMapped = settlements.map((s) => ({
      ...s,
      amount: Number(s.amount),
    }));

    const expensesMapped = expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
      splits: e.splits.map((s) => ({
        ...s,
        splitAmount: Number(s.splitAmount),
      })),
    }));

    expenses.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    settlements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const memberDetailsMappingWithId: {
      [key: string]: Member;
    } = {};

    groupMembers?.forEach((m) => {
      memberDetailsMappingWithId[m.id] = m;
    });

    return {
      expenses: expensesMapped,
      settlements: settlementsMapped,
      allMembersBalances,
      totalExpenses,
      totalSettlements,
      netBalances,
      groupDetails: {
        name: group?.name,
        id: group?.id,
        description: group?.description,
        createdAt: group?.createdAt,
        members: group?.members,
        adminId: group?.adminId,
      },
      memberDetailsMappingWithId,
    };
  } catch (error) {
    console.log("Error in getting group expenses", error);
    throw new Error("Error getting group expenses");
  }
}
