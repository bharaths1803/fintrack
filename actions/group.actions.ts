"use server";

import { revalidatePath } from "next/cache";
import { Group } from "../types";
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
