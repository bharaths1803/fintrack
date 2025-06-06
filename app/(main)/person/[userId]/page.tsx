import { getExpensesBetweenUsers } from "../../../../actions/expense.action";
import { getDbUserId } from "../../../../actions/user.action";
import PersonClientPage from "../_components/PersonClientPage";

export const dynamic = "force-dynamic";

interface PersonProps {
  params: Promise<{
    userId: string;
  }>;
}

const Person = async ({ params }: PersonProps) => {
  const dbUserId = await getDbUserId();
  if (!dbUserId) return;

  const { userId } = await params;

  const personData = await getExpensesBetweenUsers(userId);

  console.log("Other user data", personData);

  return <PersonClientPage personData={personData} dbUserId={dbUserId} />;
};

export default Person;
