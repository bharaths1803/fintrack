"use client";

import { getCategories } from "../../../../actions/categories.action";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  scanReciept,
  updateTransaction,
} from "../../../../actions/transaction.action";
import { FilterOptions, TransactionWithCategory } from "../../../../types";
import { addDays, format } from "date-fns";
import {
  AlertTriangleIcon,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Download,
  Edit2,
  Filter,
  Loader,
  Plus,
  Repeat,
  Scan,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAccounts } from "../../../../actions/account.action";
import axios from "axios";
import Link from "next/link";
import Pagination from "./Pagination";

type Transactions = Awaited<ReturnType<typeof getTransactions>>;
type Categories = Awaited<ReturnType<typeof getCategories>>;
type Accounts = Awaited<ReturnType<typeof getAccounts>>;

interface TransactionsPageClientProps {
  transactions: Transactions;
  categories: Categories;
  accounts: Accounts;
}

const pageSize = 10;

const TransactionsPageClient = ({
  transactions,
  categories,
  accounts,
}: TransactionsPageClientProps) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isScanningReceipt, setIsScanningReceipt] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isExportingTransactionsData, setIsExportingTransactionsData] =
    useState<boolean>(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<TransactionWithCategory | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<Omit<TransactionWithCategory, "id">>(
    {
      type: "EXPENSE",
      amount: 0.0,
      note: "",
      date: new Date(),
      categoryId: categories?.[0]?.id || "",
      isRecurring: false,
      isCompleted: true,
      accountId: accounts?.[0]?.id || "",
    }
  );

  const [editingTransactionId, setEditingTransactionId] = useState<string>("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: "ALL",
    searchTerm: "",
    categoryId: null,
    startDate: null,
    endDate: null,
    accountId: "ALL",
  });

  const handleOpenModal = (transaction?: TransactionWithCategory) => {
    if (transaction) {
      console.log("Category id is", transaction.categoryId);
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        note: transaction.note,
        date: transaction.date,
        categoryId: transaction.categoryId,
        isRecurring: transaction.isRecurring,
        recurringInterval: transaction.recurringInterval,
        isCompleted: transaction.isCompleted,
        reminderDays: transaction.reminderDays,
        accountId: transaction.accountId,
      });
      setEditingTransactionId(transaction.id);
    } else {
      setFormData({
        type: "EXPENSE",
        amount: 0.0,
        note: "",
        date: new Date(),
        categoryId: filteredCategories?.[0]?.id || "",
        isRecurring: false,
        isCompleted: true,
        accountId: accounts?.[0]?.id || "",
      });
      setEditingTransactionId("");
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    e.preventDefault();
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else {
      if (name === "date")
        setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
      else setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.note.trim()) {
      errors.note = "Description is required.";
    }
    if (!formData.amount) {
      errors.amount = "Amount is required.";
    }
    if (!formData.date) {
      errors.date = "Date is required.";
    }
    if (formData.isRecurring && !formData.recurringInterval) {
      errors.recurringInterval = "Select an interval";
    }
    if (!formData.isCompleted && !formData.reminderDays) {
      errors.reminderDays = "Reminder days is required";
    }
    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const formValues = {
        ...formData,
        categoryId: formData.categoryId || filteredCategories?.[0].id || "",
      };
      if (formValues.reminderDays)
        formValues.reminderDays = Number(formValues.reminderDays);
      let res;
      if (editingTransactionId)
        res = await updateTransaction({
          ...formValues,
          id: editingTransactionId,
        });
      else res = await createTransaction(formValues);
      handleCloseModal();
      if (res?.success)
        toast.success(
          `${editingTransactionId ? "Edited" : "Added"} transaction successfully!`
        );
      else throw new Error(res?.error as string);
      setEditingTransactionId("");
    } catch (error) {
      toast.error(
        `Failed to ${editingTransactionId ? "edit" : "add"} transaction!`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = (transaction: TransactionWithCategory) => {
    setDeletingTransaction(transaction);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    try {
      setIsDeleting(true);
      const res = await deleteTransaction(deletingTransaction?.id);
      handleCloseDeleteModal();
      if (res?.success) toast.success("Deleted transaction successfully!");
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error("Failed to delete transaction!");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterOptions({
      type: "ALL",
      searchTerm: "",
      categoryId: null,
      startDate: null,
      endDate: null,
      accountId: "ALL",
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (field: keyof FilterOptions, value: any) => {
    setFilterOptions((prev) => ({ ...prev, [field]: value }));
  };

  const filteredTransactions = useMemo(() => {
    setCurrentPage(1);
    let result = transactions;
    if (filterOptions.searchTerm) {
      const searchTermLower = filterOptions.searchTerm.toLowerCase();
      result = result?.filter((t) =>
        t.note.toLowerCase().includes(searchTermLower)
      );
    }
    if (filterOptions.startDate) {
      const start = new Date(filterOptions.startDate);
      result = result?.filter((t) => new Date(t.date) >= start);
    }
    if (filterOptions.endDate) {
      const end = new Date(filterOptions.endDate);
      end.setDate(end.getDate() + 1);
      result = result?.filter((t) => new Date(t.date) <= end);
    }
    if (filterOptions.type !== "ALL") {
      result = result?.filter((t) => t.type === filterOptions.type);
    }
    if (filterOptions.categoryId && filterOptions.categoryId !== "ALL") {
      console.log("Category id filteroptions", filterOptions.categoryId);
      result = result?.filter((t) => t.categoryId === filterOptions.categoryId);
    }
    if (filterOptions.accountId && filterOptions.accountId !== "ALL") {
      result = result?.filter((t) => t.accountId === filterOptions.accountId);
    }
    return result;
  }, [
    filterOptions.categoryId,
    filterOptions.endDate,
    filterOptions.searchTerm,
    filterOptions.startDate,
    filterOptions.type,
    filterOptions.accountId,
    categories,
  ]);

  const filteredCategories = useMemo(() => {
    return categories?.filter((category) => category.type === formData.type);
  }, [categories, formData.type]);

  const getDueStatus = (transaction: TransactionWithCategory) => {
    if (transaction.isCompleted) return;

    const dueDate = new Date(transaction.date);
    const today = new Date();
    const reminderDate = addDays(dueDate, -transaction.reminderDays!);
    if (dueDate < today) return { type: "overdue", text: "Overdue" };
    else if (reminderDate <= today) {
      const daysLeft = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(transaction.amount, daysLeft);
      return {
        type: "due-soon",
        text: `Due in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
      };
    } else return null;
  };

  const handleDownloadTransactionsData = async () => {
    try {
      setIsExportingTransactionsData(true);
      const res = await axios.post("/api/exports/transactions", filterOptions, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("Download failed", error);
    } finally {
      setIsExportingTransactionsData(false);
    }
  };

  const handleUploadReciept = () => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReceiptScan = async (file: File) => {
    try {
      setIsScanningReceipt(true);
      if (file.size > 1024 * 1024 * 5) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const res = await scanReciept(file);
      if (res) {
        console.log(
          "Response from ai type is",
          res.amount,
          res.date,
          res.description
        );

        setFormData((prev) => ({
          ...prev,
          amount: res.amount,
          date: new Date(res.date),
          note: res.description,
          type: res.type,
        }));
        console.log(
          "Form data types is",
          formData.amount,
          formData.date,
          formData.note
        );
        toast.success("Scanned receipt successfully");
      }
    } catch (error) {
      console.log("Error scanning ", error);
    } finally {
      setIsScanningReceipt(false);
    }
  };

  const [pageFilteredTransactions, setPageFilteredTransactions] =
    useState(filteredTransactions);

  useEffect(() => {
    if (currentPage) {
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      setPageFilteredTransactions(
        filteredTransactions?.slice(startIdx, endIdx)
      );
    }
  }, [currentPage, filteredTransactions]);

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="sm:flex items-center justify-between">
        <h1 className="text-gray-900 font-bold text-2xl">Transactions</h1>
        <button
          className="flex items-center btn-primary mt-4 sm:mt-0"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="mr-1" />
          Add Transaction
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:items-center sm:space-y-0">
          <div className="flex-1 relative">
            <div className="pl-3 flex items-center pointer-events-none absolute left-0 inset-y-0">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Transactions..."
              value={filterOptions.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10 py-2 pr-4 border border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500 w-full z-10"
            />
          </div>

          <button
            className="btn-outline flex items-center justify-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filterOptions.startDate || ""}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className={`input`}
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filterOptions.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className={`input`}
              />
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
                value={filterOptions.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className={`input`}
              >
                <option value="ALL">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
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
                value={filterOptions.categoryId || ""}
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
                className={`input`}
              >
                <option value="ALL">All Categories</option>
                {filterOptions.type === "INCOME" ||
                filterOptions.type === "ALL" ? (
                  <optgroup label="INCOME">
                    {categories?.map((category, idx) => {
                      if (category.type === "INCOME")
                        return (
                          <option value={category.id} key={idx}>
                            {category.name}
                          </option>
                        );
                    })}
                  </optgroup>
                ) : null}
                {filterOptions.type === "EXPENSE" ||
                filterOptions.type === "ALL" ? (
                  <optgroup label="EXPENSE">
                    {categories?.map((category, idx) => {
                      if (category.type === "EXPENSE")
                        return (
                          <option value={category.id} key={idx}>
                            {category.name}
                          </option>
                        );
                    })}
                  </optgroup>
                ) : null}
              </select>
            </div>
            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Account
              </label>
              <select
                id="accountId"
                name="accountId"
                value={filterOptions.accountId || ""}
                onChange={(e) =>
                  handleFilterChange("accountId", e.target.value)
                }
                className={`input`}
              >
                <option value={"ALL"}>All Accounts</option>
                {accounts?.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end md:col-span-2 lg:col-span-4">
              <button
                className="flex items-center btn-outline"
                onClick={clearFilters}
              >
                <X className="mr-2" size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Transactions */}

      <div className="flex justify-start sm:justify-end my-5">
        <button
          className="btn-outline flex items-center px-3 py-2 text-xs"
          onClick={handleDownloadTransactionsData}
          disabled={isExportingTransactionsData}
        >
          {isExportingTransactionsData ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <>
              <Download size={18} className="mr-1" />
              Download Transactions
            </>
          )}
        </button>
      </div>

      {/* Transactions Table */}
      {filteredTransactions?.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="py-8 text-center">
            <p className="text-gray-500">No Transactions found</p>
            <button
              className="btn-primary mt-4"
              onClick={() => handleOpenModal()}
            >
              Add your first transaction
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Recurring
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs text-left text-gray-500 font-medium uppercase tracking-wide"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageFilteredTransactions?.map((transaction, idx) => {
                    const dueStatus = getDueStatus(transaction);
                    return (
                      <tr
                        className="hover:bg-gray-50 transition-colors"
                        key={idx}
                      >
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {transaction.note}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {transaction.category.iconUrl}{" "}
                          {transaction.category.name}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div
                            className={`flex items-center ${
                              transaction.type === "INCOME"
                                ? "text-success-600"
                                : "text-error-600"
                            }`}
                          >
                            {transaction.type === "INCOME" ? (
                              <ArrowUpRight size={16} className="mr-1" />
                            ) : (
                              <ArrowDownRight size={16} className="mr-1" />
                            )}
                            ${transaction.amount.toFixed(2)}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap`}
                        >
                          {transaction.isRecurring ? (
                            <div className="flex items-center text-primary-600">
                              <Repeat className="mr-2" size={16} />
                              <span className="capitalize">
                                {transaction.recurringInterval}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 w-full pl-7">-</span>
                          )}
                        </td>

                        <td
                          className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap`}
                        >
                          {transaction.isCompleted ? (
                            <span className="px-2 py-1 inline-flex items-center bg-success-100 text-success-800 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          ) : dueStatus ? (
                            <span
                              className={`inline-flex items-center px-2 py-1 ${
                                dueStatus.type === "overdue"
                                  ? "bg-error-100 text-error-800"
                                  : "bg-warn-100 text-warning-800"
                              } rounded-full text-xs font-medium`}
                            >
                              {dueStatus.text}
                            </span>
                          ) : (
                            <span className="px-2 py-1 flex items-center bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex justify-start ml-2 gap-2 items-center">
                            <button
                              className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                              onClick={() => handleOpenModal(transaction)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                              onClick={() => handleOpenDeleteModal(transaction)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalCnt={filteredTransactions?.length || 100}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}

      {/* Add or Edit Transaction Modal */}
      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50 max-h-[90%] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  {editingTransactionId
                    ? "Update Transaction"
                    : "Add Transaction"}
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>
              <form className="p-4 space-y-4" onSubmit={handleSubmit}>
                {!editingTransactionId && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReceiptScan(file);
                      }}
                    />
                    <button
                      className={`btn-primary w-full p-2 flex items-center justify-center ${isScanningReceipt ? "bg-primary-400" : ""}`}
                      type="button"
                      onClick={handleUploadReciept}
                      disabled={isScanningReceipt}
                    >
                      <Scan size={18} className="mr-2" />
                      {isScanningReceipt
                        ? "Scanning..."
                        : "Scan Transaction Receipt"}
                    </button>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="note"
                    name="note"
                    value={formData.note}
                    placeholder="What was this transaction for?"
                    onChange={handleChange}
                    className={`input ${
                      formErrors.note
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.note && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.note}
                    </p>
                  )}
                </div>
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
                {accounts && accounts.length > 0 ? (
                  <div>
                    <label
                      htmlFor="accountId"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Account
                    </label>
                    <select
                      id="accountId"
                      name="accountId"
                      value={formData.accountId || accounts?.[0]?.id}
                      onChange={handleChange}
                      className={`input`}
                      disabled={!!editingTransactionId}
                    >
                      {accounts?.map((account, idx) => (
                        <option value={account.id} key={idx}>
                          {account.accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-warning-50 rounded-md">
                    <div className="flex space-x-2 items-center">
                      <AlertTriangleIcon
                        size={18}
                        className="text-warning-500"
                      />
                      <h3 className="font-medium text-sm text-warning-800">
                        No Accounts
                      </h3>
                    </div>
                    <div className="mt-1">
                      <Link
                        className="text-warning-700 mt-1"
                        href={"/accounts"}
                      >
                        Add your first account
                      </Link>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Transaction Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="EXPENSE"
                        onChange={handleChange}
                        checked={formData.type === "EXPENSE"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Expense</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="INCOME"
                        onChange={handleChange}
                        checked={formData.type === "INCOME"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Income</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={handleChange}
                    className={`input ${
                      formErrors.date
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                {filteredCategories && filteredCategories.length > 0 ? (
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
                      value={formData.categoryId}
                      onChange={handleChange}
                      className={`input`}
                    >
                      {filteredCategories?.map((filteredCategory, idx) => (
                        <option value={filteredCategory.id} key={idx}>
                          {filteredCategory.iconUrl} {filteredCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-warning-50 rounded-md">
                    <div className="flex space-x-2 items-center">
                      <AlertTriangleIcon
                        size={18}
                        className="text-warning-500"
                      />
                      <h3 className="font-medium text-sm text-warning-800">
                        No Custom Categories
                      </h3>
                    </div>
                    <div className="mt-1">
                      <Link
                        className="text-warning-700 mt-1"
                        href={"/categories"}
                      >
                        Add your first category
                      </Link>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      name="isCompleted"
                      checked={formData.isCompleted}
                      onChange={handleChange}
                      className="border-gray-300 rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <label
                      htmlFor="isCompleted"
                      className="ml-2 block text-sm font-medium text-gray-700"
                    >
                      Completed
                    </label>
                  </div>

                  {!formData.isCompleted && (
                    <div>
                      <label
                        htmlFor="reminderDays"
                        className="block text-sm font-medium text-gray-900 mb-1"
                      >
                        Remind me before (days)
                      </label>
                      <input
                        type="number"
                        id="reminderDays"
                        name="reminderDays"
                        value={formData.reminderDays || 7}
                        min={"0"}
                        step={"1"}
                        onChange={handleChange}
                        className={`input ${
                          formErrors.reminderDays
                            ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                            : ""
                        }`}
                      />
                      {formErrors.reminderDays && (
                        <p className="mt-1 text-error-600 text-sm">
                          {formErrors.reminderDays}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="border-gray-300 rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <label
                      htmlFor="isRecurring"
                      className="ml-2 block text-sm font-medium text-gray-700"
                    >
                      Recurring Transaction
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div>
                      <label
                        htmlFor="recurringInterval"
                        className="block text-sm font-medium text-gray-900 mb-1"
                      >
                        Recurring Interval
                      </label>
                      <select
                        id="recurringInterval"
                        name="recurringInterval"
                        value={formData.recurringInterval || ""}
                        onChange={handleChange}
                        className={`input`}
                      >
                        <option value={"DAILY"}>Daily</option>
                        <option value={"WEEKLY"}>Weekly</option>
                        <option value={"MONTHLY"}>Monthly</option>
                        <option value={"YEARLY"}>Yearly</option>
                      </select>
                    </div>
                  )}
                </div>
                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : editingTransactionId ? (
                    "Update Transaction"
                  ) : (
                    "Add Transaction"
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
                  Delete Transaction
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseDeleteModal}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-lg font-semibold p-4">
                Are you sure you want to delete this transaction?
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

export default TransactionsPageClient;
