"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { Settlement } from "../types";
import { getDbUserId } from "./user.action";

export async function createSettlement(data: Omit<Settlement, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const settlement = await prisma.settlements.create({
      data,
    });
    revalidatePath("/person");
    return { success: true, settlement };
  } catch (error) {
    console.log("Error creating settlement", error);
    return { success: false, error };
  }
}
