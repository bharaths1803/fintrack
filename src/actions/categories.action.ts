"use server";
import { Category } from "@/types";
import { getDbUserId } from "./user.action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: Omit<Category, "id">) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const category = await prisma.category.create({
      data: {
        userId,
        ...data,
      },
    });
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getCategories() {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
    });
    return categories;
  } catch (error) {
    console.log("Error in getting user categories", error);
    throw new Error("Error getting user categories");
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!category) throw new Error("Category not found");
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.log("Error in delete user categories", error);
    return { success: false, error };
  }
}

export async function updateCategory(data: Category) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    const { id, ...categoryData } = data;
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: categoryData,
    });
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error) {
    console.log("Error in updating category", error);
    return { success: false, error };
  }
}
