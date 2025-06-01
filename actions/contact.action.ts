"use server";

import { revalidatePath } from "next/cache";
import { Group } from "../types";
import { getDbUserId } from "./user.action";
import { prisma } from "../lib/prisma";

export async function getSearchedUsers(query: string) {
  try {
    if (!query || query.length === 0) return [];
    const searchedUsers = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        profilePicUrl: true,
      },
    });

    return searchedUsers;
  } catch (error) {
    console.log("Error in getting searched users", error);
    throw new Error("Error getting searched users");
  }
}

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
    console.log("Selected members", selectedMembers);
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

export async function getContacts() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const expensesIPaid = await prisma.expense.findMany({
      where: {
        userId,
      },
      include: {
        splits: {
          select: {
            userId: true,
          },
        },
      },
    });

    let expensesNotPaidByMe = await prisma.expense.findMany({
      include: {
        splits: {
          select: {
            userId: true,
          },
        },
      },
    });

    expensesNotPaidByMe = expensesNotPaidByMe.filter((e) => {
      return e.userId !== userId && e.splits.some((s) => s.userId === userId);
    });

    const myExpenses = [...expensesIPaid, ...expensesNotPaidByMe];

    const contactIds = new Set<string>();

    myExpenses.forEach((e) => {
      e.splits.forEach((s) => contactIds.add(s.userId));
    });

    let people = await Promise.all(
      [...contactIds].map(async (id) => {
        const user = await prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            profilePicUrl: true,
            email: true,
          },
        });
        return user;
      })
    );

    people = people.filter((p) => p?.id !== userId);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            members: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const groups = user?.groups;

    people?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

    groups?.sort((a, b) => a.name.localeCompare(b.name));

    return {
      people,
      groups,
    };
  } catch (error) {
    console.log("Error in getting user contacts", error);
    throw new Error("Error getting user contacts");
  }
}
