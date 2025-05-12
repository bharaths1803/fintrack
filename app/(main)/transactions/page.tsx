import { getTransactions } from "../../../actions/transaction.action";
import { getDbUserId } from "../../../actions/user.action";
import React from "react";
import TransactionsPageClient from "./_components/TransactionsPageClient";
import { getCategories } from "../../../actions/categories.action";
import { getAccounts } from "../../../actions/account.action";

const TransactionsPage = async () => {
  const dbUserId = await getDbUserId();
  const transactions = await getTransactions();
  const categories = await getCategories();
  const accounts = await getAccounts();

  console.log("Accounts", accounts);

  return (
    <TransactionsPageClient
      transactions={transactions}
      categories={categories}
      accounts={accounts}
    />
  );
};

export default TransactionsPage;
