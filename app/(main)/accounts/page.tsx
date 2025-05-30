export const dynamic = "force-dynamic";

import AccountsPageClient from "./_components/AccountsPageClient";
import { getAccounts } from "../../../actions/account.action";

const AccountsPage = async () => {
  const accounts = await getAccounts();

  console.log("Accounts", accounts);
  return <AccountsPageClient accounts={accounts} />;
};

export default AccountsPage;
