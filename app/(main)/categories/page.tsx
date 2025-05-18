import CategoriesPageClient from "./_components/CategoriesPageClient";
import { getCategories } from "../../../actions/categories.action";

const CategoriesPage = async () => {
  const categories = await getCategories();

  console.log("Categories", categories);
  return <CategoriesPageClient categories={categories} />;
};

export default CategoriesPage;
