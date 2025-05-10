import { getTransactions } from "../../../actions/transaction.action";
import { getDbUserId } from "../../../actions/user.action";
import React from "react";
import TransactionsPageClient from "./_components/TransactionsPageClient";
import { getCategories } from "../../../actions/categories.action";

const TransactionsPage = async () => {
  const dbUserId = await getDbUserId();
  const transactions = await getTransactions();
  const categories = await getCategories();

  console.log("Transactions", transactions);

  return (
    <TransactionsPageClient
      transactions={transactions}
      categories={categories}
    />
  );
};

export default TransactionsPage;
