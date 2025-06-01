"use client";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../../actions/categories.action";
import { EMOJI_LIST } from "../../../../data";
import { Category } from "../../../../types";
import { Check, Edit2, Loader, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Categories = Awaited<ReturnType<typeof getCategories>>;

interface CategoriesPageClientProps {
  categories: Categories;
}

const CategoriesPageClient = ({ categories }: CategoriesPageClientProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const [formData, setFormData] = useState<Omit<Category, "id">>({
    name: "",
    type: "EXPENSE",
    iconUrl: "💰",
  });

  const [editingCategoryId, setEditingCategoryId] = useState<string>("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        iconUrl: category.iconUrl,
      });
      setEditingCategoryId(category.id);
    } else {
      setFormData({
        name: "",
        type: "EXPENSE",
        iconUrl: "💰",
      });
      setEditingCategoryId("");
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setFormData((prev) => ({ ...prev, iconUrl: emoji }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }
    if (!formData.iconUrl) {
      errors.iconUrl = "Icon is required.";
    }
    if (!formData.type) {
      errors.type = "Type is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      let res;
      if (editingCategoryId)
        res = await updateCategory({ ...formData, id: editingCategoryId });
      else res = await createCategory(formData);
      handleCloseModal();
      if (res?.success)
        toast.success(
          `${editingCategoryId ? "Edited" : "Added"} category successfully!`
        );
      else throw new Error(res?.error as string);
      setEditingCategoryId("");
    } catch (error) {
      toast.error(`Failed to ${editingCategoryId ? "edit" : "add"} category!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      const res = await deleteCategory(deletingCategory?.id);
      handleCloseDeleteModal();
      if (res?.success) toast.success("Deleted category successfully!");
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error("Failed to delete category!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex items-center justify-between">
        <h1 className="text-gray-900 font-bold text-2xl">Categories</h1>
        <button
          className="flex items-center btn-primary mt-4 sm:mt-0"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="mr-1" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories?.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="py-8 text-center">
            <p className="text-gray-500">No categories found</p>
            <button
              className="btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              Add your first category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category, idx) => (
            <div
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              key={idx}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center">
                  <span className="text-2xl">{category.iconUrl}</span>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </div>
                <div className="flex justify-center gap-2 items-center">
                  <button
                    className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                    onClick={() => handleOpenModal(category)}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                    onClick={() => handleOpenDeleteModal(category)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 ${
                  category.type === "EXPENSE"
                    ? "bg-error-100 text-error-800"
                    : "bg-success-100 text-success-800"
                }`}
              >
                {category.type === "EXPENSE" ? "expense" : "income"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add or Edit Category Modal */}
      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  {editingCategoryId ? "Update Category" : "Add Category"}
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
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    placeholder="e.g., Food"
                    onChange={handleChange}
                    className={`input ${
                      formErrors.name
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`input`}
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="iconUrl"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Icon
                  </label>
                  <div className="grid grid-cols-8 max-h-40 overflow-y-auto p-2 gap-2 border border-gray-200 bg-gray-50 rounded-lg">
                    {EMOJI_LIST.map((emoji, idx) => (
                      <button
                        key={idx}
                        className={`${
                          formData.iconUrl === emoji ? "bg-gray-200" : ""
                        } hover:bg-gray-200 p-1 text-2xl rounded-md`}
                        onClick={() => handleSelectEmoji(emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {formErrors.iconUrl && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.iconUrl}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900">
                    Selected:{" "}
                  </span>
                  <span className="text-2xl">{formData.iconUrl}</span>
                </div>
                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : editingCategoryId ? (
                    "Update Category"
                  ) : (
                    "Add Category"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Delete Category
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseDeleteModal}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-lg font-semibold p-4">
                Are you sure you want to delete category{" "}
                {deletingCategory?.iconUrl} {deletingCategory?.name}?
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

export default CategoriesPageClient;
