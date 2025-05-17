"use client";

import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../../../../actions/budget.action";
import {
  updateCategory,
  createCategory,
  deleteCategory,
  getCategories,
} from "../../../../actions/categories.action";
import { EMOJI_LIST, monthOptions } from "../../../../data";
import {
  Budget,
  BudgetWithCategory,
  Category,
  FilterOptionsBudgets,
} from "../../../../types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader,
  Check,
  AlertTriangleIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import BudgetProgess from "../../_components/BudgetProgress";

type Budgets = Awaited<ReturnType<typeof getBudgets>>;
type Categories = Awaited<ReturnType<typeof getCategories>>;

interface BudgetsPageClientProps {
  budgets: Budgets;
  categories: Categories;
}

const BudgetPageClient = ({ budgets, categories }: BudgetsPageClientProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteingBudget, setDeletingBudget] =
    useState<BudgetWithCategory | null>(null);

  const [filterOptions, setFilterOptions] = useState<FilterOptionsBudgets>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const [formData, setFormData] = useState<Omit<BudgetWithCategory, "id">>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    categoryId: categories?.[0]?.id || "",
  });

  const [editingBudgetId, setEditingBudgetId] = useState<string>("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenModal = (budget?: BudgetWithCategory) => {
    if (budget) {
      console.log("Category id", budget.categoryId);
      setEditingBudgetId(budget.id);
      setFormData((p) => ({
        month: budget.month,
        year: budget.year,
        amount: budget.amount,
        categoryId: budget.categoryId,
      }));
    } else {
      setFormData((p) => ({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        amount: 0,
        categoryId: formFilteredCategories?.[0]?.id || "",
      }));
      setEditingBudgetId("");
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
    setFormData({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      amount: 0,
      categoryId: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === "month" || name === "year")
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.month) {
      errors.month = "Month is required.";
    }
    if (!formData.year) {
      errors.year = "Year is required.";
    }
    if (!formData.amount) {
      errors.amount = "Amount is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      console.log("Form data for budget", formData);
      let res;
      if (editingBudgetId)
        res = await updateBudget({ ...formData, id: editingBudgetId });
      else res = await createBudget(formData);
      handleCloseModal();
      if (res?.success)
        toast.success(
          `${editingBudgetId ? "Edited" : "Added"} budget successfully!`
        );
      else throw new Error(res?.error as string);
      setEditingBudgetId("");
    } catch (error) {
      toast.error(`Failed to ${editingBudgetId ? "edit" : "add"} budget!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = (budget: BudgetWithCategory) => {
    setDeletingBudget(budget);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteingBudget) return;
    try {
      setIsDeleting(true);
      const res = await deleteBudget(deleteingBudget?.id);
      handleCloseDeleteModal();
      if (res?.success) toast.success("Deleted budget successfully!");
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error("Failed to delete budget!");
    } finally {
      setIsDeleting(false);
    }
  };

  const currYear = new Date().getFullYear();

  const formFilteredCategories = useMemo(() => {
    let t = budgets;
    if (formData?.month) {
      t = t?.filter((b) => {
        return b.month == formData.month;
      });
    }

    if (formData?.year) {
      t = t?.filter((b) => b.year == formData.year);
    }
    let result = categories;
    result = result?.filter((c) => !t?.some((b) => b.categoryId === c?.id));
    if (!editingBudgetId)
      setFormData((p) => ({
        ...p,
        categoryId: result?.[0]?.id || "",
      }));
    return result;
  }, [formData.month, formData.year, budgets, categories]);

  const filteredBudgets = useMemo(() => {
    let res = budgets;
    if (filterOptions.month) {
      res = res?.filter((b) => b.month == filterOptions.month);
    }
    if (filterOptions.year) {
      res = res?.filter((b) => b.year == filterOptions.year);
    }
    return res;
  }, [filterOptions.month, filterOptions.year, budgets]);

  const handleFilterChange = (
    field: keyof FilterOptionsBudgets,
    value: any
  ) => {
    setFilterOptions((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex items-center justify-between">
        <h1 className="text-gray-900 font-bold text-2xl">Budgets</h1>
        <button
          className="flex items-center btn-primary mt-4 sm:mt-0"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="mr-1" />
          Add Budget
        </button>
      </div>

      {/* FilterOptions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="month"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Month
            </label>
            <select
              id="month"
              name="month"
              value={filterOptions.month}
              onChange={(e) => handleFilterChange("month", e.target.value)}
              className={`input`}
            >
              {monthOptions.map((month) => (
                <option value={month.value} key={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Year
            </label>
            <select
              id="year"
              name="year"
              value={filterOptions.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className={`input`}
            >
              <option value={currYear}>{currYear}</option>
              <option value={currYear + 1}>{currYear + 1}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add or Edit Budget */}
      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  {editingBudgetId ? "Update Budget" : "Add Budget"}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>

              <form className="p-4 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    placeholder="0.00"
                    min={"0"}
                    step={"0.01"}
                    onChange={handleChange}
                    className={`input ${
                      formErrors.amount
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Month
                  </label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className={`input`}
                    disabled={!!editingBudgetId}
                  >
                    {monthOptions.map((month) => (
                      <option value={month.value} key={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`input`}
                    disabled={!!editingBudgetId}
                  >
                    <option value={currYear}>{currYear}</option>
                    <option value={currYear + 1}>{currYear + 1}</option>
                  </select>
                </div>

                {formFilteredCategories?.length === 0 && !editingBudgetId ? (
                  <div className="p-4 bg-warning-50 rounded-md">
                    <AlertTriangleIcon
                      size={20}
                      className="text-warning-500 mr-1 mt-1"
                    />
                    <div className="mt-1">
                      <h3 className="font-medium text-warning-800">
                        All categories have budgets
                      </h3>
                      <p className="text-warning-700 mt-1">
                        You've already created budgets for all categories for
                        selected month and year or there is no category.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="categoryId"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId || ""}
                      onChange={handleChange}
                      className={`input`}
                      disabled={!!editingBudgetId}
                    >
                      {!editingBudgetId &&
                        formFilteredCategories?.map((cat, idx) => {
                          return (
                            <option value={cat.id} key={idx}>
                              {cat.iconUrl} {cat.name}
                            </option>
                          );
                        })}
                      {editingBudgetId && (
                        <option value={formData.categoryId ?? ""}>
                          {
                            categories?.find(
                              (cat) => cat.id === formData.categoryId
                            )?.iconUrl
                          }{" "}
                          {
                            categories?.find(
                              (cat) => cat.id === formData.categoryId
                            )?.name
                          }
                        </option>
                      )}
                    </select>
                  </div>
                )}

                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : editingBudgetId ? (
                    "Update Budget"
                  ) : (
                    "Add Budget"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Budgets list */}
      {filteredBudgets?.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="py-8 text-center">
            <p className="text-gray-500">No budgets found</p>
            <button
              className="btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              Add your first budget
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets?.map((budget, idx) => (
            <div
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              key={idx}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-2xl">{budget.category?.iconUrl}</span>
                  <h3 className="font-medium text-gray-900">
                    {budget.category?.name}
                  </h3>
                </div>
                <div className="flex justify-center gap-2 items-center">
                  <button
                    className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                    onClick={() => handleOpenModal(budget)}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                    onClick={() => handleOpenDeleteModal(budget)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <BudgetProgess
                goalAmount={budget.amount}
                spentAmount={budget.totalSpent}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Budget Modal */}
      {showDeleteModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Delete This Budget
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseDeleteModal}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-lg font-semibold p-4">
                Are you sure you want to delete this budget for{" "}
                {
                  categories?.find(
                    (cat) => cat.id === deleteingBudget?.categoryId
                  )?.iconUrl
                }{" "}
                {
                  categories?.find(
                    (cat) => cat.id === deleteingBudget?.categoryId
                  )?.name
                }
                ?
              </p>
              <div className="grid grid-cols-2 gap-2 p-4">
                <button
                  className="flex items-center btn-accent bg-warning-700 hover:bg-warning-800 mt-4 sm:mt-0"
                  onClick={handleCloseDeleteModal}
                >
                  <X size={18} className="mr-1" />
                  Cancel
                </button>
                <button
                  className={`flex items-center ${
                    isDeleting ? "justify-center" : ""
                  } btn-primary mt-4 sm:mt-0`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={18} className="mr-1" /> {"Confirm"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetPageClient;
