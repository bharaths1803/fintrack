"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { Settlement } from "../types";
import { getDbUserId } from "./user.action";

const serializeSettlement = (obj: any) => {
  return { ...obj, amount: obj.amount.toNumber() };
};

export async function createSettlement(data: Omit<Settlement, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const settlement = await prisma.settlements.create({
      data,
    });

    revalidatePath("/person");
    revalidatePath("/group");

    return { success: true, settlement: serializeSettlement(settlement) };
  } catch (error) {
    console.log("Error creating settlement", error);
    return { success: false, error };
  }
}
