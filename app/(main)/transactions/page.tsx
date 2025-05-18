import { getTransactions } from "../../../actions/transaction.action";
import TransactionsPageClient from "./_components/TransactionsPageClient";
import { getCategories } from "../../../actions/categories.action";
import { getAccounts } from "../../../actions/account.action";

const TransactionsPage = async () => {
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
