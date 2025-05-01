import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export const syncUser = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;
    const loggedInUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (loggedInUser) return loggedInUser;

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        name,
        email: user.emailAddresses[0].emailAddress,
        profilePicUrl: user.imageUrl,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
};
