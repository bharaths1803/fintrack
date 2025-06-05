import { getGroupExpenses } from "../../../../actions/group.actions";
import { getDbUserId } from "../../../../actions/user.action";
import GroupClientPage from "../_components/GroupClientPage";

export const dynamic = "force-dynamic";

interface GroupPageProps {
  params: {
    groupId: string;
  };
}

const GroupPage = async ({ params }: GroupPageProps) => {
  const dbUserId = await getDbUserId();
  if (!dbUserId) return;

  const { groupId } = params;

  const groupData = await getGroupExpenses(groupId);

  console.log("Group data", groupData);

  return <GroupClientPage dbUserId={dbUserId} groupData={groupData} />;
};

export default GroupPage;
