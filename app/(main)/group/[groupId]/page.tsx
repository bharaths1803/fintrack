import { getDbUserId } from "../../../../actions/user.action";
import GroupClientPage from "../_components/GroupClientPage";

export const dynamic = "force-dynamic";

interface PersonProps {
  params: {
    groupId: string;
  };
}

const Person = async ({ params }: PersonProps) => {
  const dbUserId = await getDbUserId();
  if (!dbUserId) return;

  const { groupId } = params;

  console.log("Group", groupId);

  return <GroupClientPage dbUserId={dbUserId} />;
};

export default Person;
