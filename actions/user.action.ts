import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDbUserId() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });
  return user?.id;
}
