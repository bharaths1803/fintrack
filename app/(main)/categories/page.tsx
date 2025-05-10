import React from "react";
import CategoriesPageClient from "./_components/CategoriesPageClient";
import { getDbUserId } from "../../../actions/user.action";
import { getCategories } from "../../../actions/categories.action";

const CategoriesPage = async () => {
  const dbUserId = await getDbUserId();
  const categories = await getCategories();

  console.log("Categories", categories);
  return <CategoriesPageClient categories={categories} />;
};

export default CategoriesPage;
