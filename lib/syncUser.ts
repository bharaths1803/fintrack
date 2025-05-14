import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Give a unique joke related to managing personal finances in 2 or 3 lines in string format without any qoutes(just plain string, e.g. I am a boy).
    `;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    await prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        financialJoke: cleanedText,
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
};
