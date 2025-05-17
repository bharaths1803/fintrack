import React from "react";
import { getDbUserId } from "../../../actions/user.action";
import BudgetPageClient from "./_components/BudgetPageClient";
import { getBudgets } from "../../../actions/budget.action";
import { getCategories } from "../../../actions/categories.action";

const BudgetPage = async () => {
  const budgets = await getBudgets();
  let categories = await getCategories();
  categories = categories?.filter((cat) => cat.type === "EXPENSE");

  console.log("Budgets", budgets);

  return <BudgetPageClient budgets={budgets} categories={categories} />;
};

export default BudgetPage;
