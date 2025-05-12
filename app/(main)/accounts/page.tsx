import React from "react";
import { getDbUserId } from "../../../actions/user.action";
import AccountsPageClient from "./_components/AccountsPageClient";
import { getAccounts } from "../../../actions/account.action";

const AccountsPage = async () => {
  const dbUserId = await getDbUserId();
  const accounts = await getAccounts();

  console.log("Accounts", accounts);
  return <AccountsPageClient accounts={accounts} />;
};

export default AccountsPage;
