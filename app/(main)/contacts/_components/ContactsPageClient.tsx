"use client";

import {
  AlertTriangleIcon,
  Loader,
  Plus,
  PlusIcon,
  Search,
  UsersIcon,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Group, Member, SharedExpense, Split } from "../../../../types";
import {
  getContacts,
  getSearchedUsers,
} from "../../../../actions/contact.action";
import toast from "react-hot-toast";
import { getCategories } from "../../../../actions/categories.action";
import { getAccounts } from "../../../../actions/account.action";
import { createExpense } from "../../../../actions/expense.action";
import Link from "next/link";
import { createGroup } from "../../../../actions/group.actions";

type SearchedUsers = Awaited<ReturnType<typeof getSearchedUsers>>;
type Categories = Awaited<ReturnType<typeof getCategories>>;
type Accounts = Awaited<ReturnType<typeof getAccounts>>;
type Contacts = Awaited<ReturnType<typeof getContacts>>;

interface ContactsPageClientProps {
  dbUserId: string;
  categories: Categories;
  accounts: Accounts;
  contacts: Contacts;
}

const ContactsPageClient = ({
  dbUserId,
  categories,
  accounts,
  contacts,
}: ContactsPageClientProps) => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchedUsers, setSearchedUsers] = useState<SearchedUsers>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState<boolean>(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<
    "INDIVIDUAL" | "GROUP"
  >("INDIVIDUAL");

  const [showExpensesModal, setShowExpensesModal] = useState<boolean>(false);
  const [isSubmittingExpenses, setIsSubmittingExpenses] =
    useState<boolean>(false);

  const [formData, setFormData] = useState<Omit<Group, "id">>({
    name: "",
    description: "",
    selectedMembers: [],
  });

  const handleOpenModal = () => {
    setFormData({
      name: "",
      description: "",
      selectedMembers: [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSearchedUsers([]);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }
    if (!formData.description.trim()) {
      errors.iconUrl = "Description is required.";
    }
    if (!formData.selectedMembers || formData.selectedMembers.length < 1) {
      errors.selectedMembers = "At least 2 members are required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const res = await createGroup(formData);
      handleCloseModal();
      if (res?.success) toast.success(`Added group successfully!`);
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error(`Failed to add group!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsSearchingUsers(true);
      const res = await getSearchedUsers(e.target.value.toLowerCase());
      setSearchedUsers(res);
    } catch (error) {
      toast.error("Unable to search users!");
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const hasAlreadyBeenSelected = (userId: string) => {
    return formData.selectedMembers.some((member) => member.id === userId);
  };

  const handleToggleMemberSelection = (user: Member) => {
    if (hasAlreadyBeenSelected(user.id))
      setFormData((p) => ({
        ...p,
        selectedMembers: formData.selectedMembers.filter(
          (member) => user.id !== member.id
        ),
      }));
    else
      setFormData((p) => ({
        ...p,
        selectedMembers: [...formData.selectedMembers, user],
      }));
  };

  //   splitType: "PERCENTAGE" | "AMOUNT" | "EQUAL";
  // amount: number;
  // description: string;
  // userId: string;
  // isSettled: boolean;
  // groupId?: string | null;
  // splits: Split[];

  const [expenseFormData, setExpenseFormData] = useState<
    Omit<SharedExpense, "id">
  >({
    splitType: "EQUAL",
    amount: 0,
    description: "",
    userId: "",
    isSettled: false,
    splits: [],
    categoryId: "",
    accountId: "",
    date: new Date(),
  });

  const [expensesFormErrors, setExpensesFormErrors] = useState<
    Record<string, string>
  >({});

  const handleOpenExpensesModal = (expenseType: typeof selectedExpenseType) => {
    setSelectedExpenseType(expenseType);
    setExpenseFormData({
      splitType: "EQUAL",
      amount: 0,
      description: "",
      userId: "",
      isSettled: false,
      splits: [],
      categoryId: categories?.[0].id || "",
      accountId: accounts?.[0].id || "",
      date: new Date(),
    });
    setShowExpensesModal(true);
  };

  const handleCloseExpensesModal = () => {
    setShowExpensesModal(false);
    setSearchedUsers([]);
    setExpensesFormErrors({});
  };

  const validateExpensesForm = () => {
    const errors: Record<string, string> = {};
    if (!expenseFormData.splitType) {
      errors.splitType = "Split Type is required.";
    }
    if (!expenseFormData.amount) {
      errors.amount = "Amount is required.";
    }
    if (!expenseFormData.description) {
      errors.description = "Description is required";
    }
    if (!expenseFormData.userId) {
      errors.userId = "Paid by user is required";
    }
    if (!expenseFormData.splits) {
      errors.splits = "Select split people";
    }
    if (selectedExpenseType === "GROUP" && !expenseFormData.groupId) {
      errors.groupId = "Must select a group";
    }
    setExpensesFormErrors(errors);
    console.log("Errors", errors);
    return Object.keys(errors).length === 0;
  };

  const handleExpensesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === "groupId") {
      const group = contacts?.groups?.find((g) => g.id === value);
      let splitsTemp: Split[] = [];

      if (group) {
        group.members.forEach((user) => {
          const splitObject: Split = {
            userId: user.id,
            name: user.name,
            profilePicUrl: user.profilePicUrl,
            hasAlreadyPaid: false,
            splitAmount: 0,
            splitPercentage: 0,
          };

          splitsTemp = [...splitsTemp, splitObject];
        });
      }
      setExpenseFormData((prev) => ({
        ...prev,
        [name]: value,
        splits: [...splitsTemp],
      }));
    } else setExpenseFormData((prev) => ({ ...prev, [name]: value }));
    if (expensesFormErrors[name]) {
      setExpensesFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleExpensesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExpensesForm()) return;

    try {
      setIsSubmittingExpenses(true);
      const res = await createExpense(expenseFormData);
      handleCloseExpensesModal();
      if (res?.success) toast.success("Created expense successfully!");
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error("Failed to create expense!");
    } finally {
      setIsSubmittingExpenses(false);
    }
  };

  const hasAlreadyBeenSelectedForSplit = (userId: string) => {
    return expenseFormData.splits.some((member) => member.userId === userId);
  };

  const handleToggleOnSplitSelection = (user: Member) => {
    setExpenseFormData((p) => {
      if (!hasAlreadyBeenSelectedForSplit(user.id)) {
        const splitObject: Split = {
          userId: user.id,
          name: user.name,
          profilePicUrl: user.profilePicUrl,
          hasAlreadyPaid: false,
          splitAmount: 0,
          splitPercentage: 0,
        };
        return {
          ...p,
          splits: [...p.splits, splitObject],
        };
      } else {
        return {
          ...p,
          splits: expenseFormData.splits.filter(
            (member) => user.id !== member.userId
          ),
        };
      }
    });
  };

  const handleToggleOffSplitSelection = (user: Split) => {
    if (hasAlreadyBeenSelectedForSplit(user.userId))
      setExpenseFormData((p) => ({
        ...p,
        splits: expenseFormData.splits.filter(
          (member) => user.userId !== member.userId
        ),
      }));
  };

  const handleSplitChange = (
    userId: string,
    value: string,
    type: "PERCENTAGE" | "AMOUNT" | "EQUAL"
  ) => {
    const updatedSplits = expenseFormData.splits.map((user) => {
      if (user.userId === userId) {
        if (type === "AMOUNT") {
          return {
            ...user,
            splitAmount: parseFloat(value) || 0,
          };
        } else if (type === "PERCENTAGE") {
          return {
            ...user,
            splitPercentage: parseFloat(value) || 0,
          };
        }
      }
      return user;
    });

    let totalAmount = 0;

    const amount = expenseFormData.amount;
    if (expenseFormData.splitType === "EQUAL") {
      const splitAmount = amount / expenseFormData.splits.length;
      const splitPercentage = (splitAmount / amount) * 100;
      updatedSplits.forEach((user) => {
        user.splitAmount = splitAmount;
        user.splitPercentage = splitPercentage;
        totalAmount += user.splitAmount;
      });
    } else if (expenseFormData.splitType === "AMOUNT") {
      updatedSplits.forEach((user) => {
        user.splitPercentage = (user.splitAmount / amount) * 100;
        totalAmount += user.splitAmount;
      });
    } else {
      updatedSplits.forEach((user) => {
        user.splitAmount = (user.splitPercentage * amount) / 100;
        totalAmount += user.splitAmount;
      });
    }
    if (totalAmount > expenseFormData.amount) {
      expensesFormErrors.exceedingTotal = "Exceeding Total Amount";
    } else if (totalAmount < expenseFormData.amount) {
      expensesFormErrors.exceedingTotal = "Less than Total Amount";
    } else {
      expensesFormErrors.exceedingTotal = "";
    }

    setExpenseFormData((p) => ({
      ...p,
      splits: updatedSplits,
    }));
  };

  useEffect(() => {
    handleSplitChange("", "", expenseFormData.splitType);
  }, [
    expenseFormData.splitType,
    expenseFormData.splits.length,
    expenseFormData.amount,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-gray-900 font-bold text-2xl">Contacts</h1>
        <button
          className="btn-primary mt-4 sm:mt-0 flex items-center"
          onClick={handleOpenModal}
        >
          <Plus size={18} className="mr-1" />
          Add Group
        </button>
      </div>

      {/* Add Group Modal */}

      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Create Group
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
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    placeholder="e.g., Dinner"
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
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    placeholder="e.g., Out for dinner"
                    onChange={handleChange}
                    className={`input ${
                      formErrors.name
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="memberIds"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Members
                  </label>
                  <div className="py-1 mb-2">
                    <div className="flex-1 relative">
                      <div className="pl-3 flex items-center pointer-events-none absolute left-0 inset-y-0">
                        <Search size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search Users..."
                        onChange={handleSearchUsers}
                        className="pl-10 py-2 pr-4 border border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500 w-full z-10"
                      />
                    </div>
                    {isSearchingUsers ? (
                      <p className="text-gray-600 mt-2">Searching...</p>
                    ) : searchedUsers && searchedUsers.length > 0 ? (
                      <div className="max-h-28 overflow-y-auto">
                        {searchedUsers.map((user) => {
                          const isAlreadySelected = hasAlreadyBeenSelected(
                            user.id
                          );
                          const isCurrentUser = dbUserId === user.id;
                          return (
                            <div
                              className="flex items-center gap-2 p-2 hover:cursor-pointer"
                              key={user.id}
                            >
                              <input
                                type="checkbox"
                                id="memberId"
                                name="memberId"
                                disabled={isCurrentUser}
                                checked={isAlreadySelected || isCurrentUser}
                                onChange={() =>
                                  handleToggleMemberSelection(user)
                                }
                                className="border-gray-300 rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                              />
                              <img
                                src={user?.profilePicUrl}
                                className="w-6 h-6 rounded-full"
                              />{" "}
                              <p className="text-sm text-gray-900">
                                {user.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                    <div className="bg-gray-200 flex items-center gap-2 rounded-lg p-2 hover:cursor-pointer">
                      <img
                        src={user?.imageUrl}
                        className="w-4 h-4 rounded-full"
                      />{" "}
                      <p className="text-gray-900 text-sm">
                        {user?.firstName} {user?.lastName} (You)
                      </p>
                    </div>
                    {formData.selectedMembers.map((member) => {
                      return (
                        <div
                          className="bg-gray-200 flex items-center gap-2 rounded-lg  hover:cursor-pointer p-2"
                          key={member.id}
                        >
                          <button
                            className=""
                            onClick={() => handleToggleMemberSelection(member)}
                          >
                            <X size={18} />
                          </button>
                          <img
                            src={member.profilePicUrl}
                            className="w-4 h-4 rounded-full"
                          />{" "}
                          <p className="text-gray-900 text-sm">
                            {member?.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {formErrors.selectedMembers && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.selectedMembers}
                    </p>
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
                  ) : (
                    "Create Group"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Add Expenses Modal */}

      {showExpensesModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50 max-h-[90%] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Add Expense
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseExpensesModal}
                >
                  <X size={20} />
                </button>
              </div>
              <form className="p-4 space-y-4" onSubmit={handleExpensesSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Expense Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="expenseType"
                        value="INDIVIDUAL"
                        onChange={(e) => setSelectedExpenseType("INDIVIDUAL")}
                        checked={selectedExpenseType === "INDIVIDUAL"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Individual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="expenseType"
                        value="GROUP"
                        onChange={(e) => setSelectedExpenseType("GROUP")}
                        checked={selectedExpenseType === "GROUP"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Group</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Split Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="splitType"
                        value="PERCENTAGE"
                        onChange={handleExpensesChange}
                        checked={expenseFormData.splitType === "PERCENTAGE"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Percentage</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="splitType"
                        value="EQUAL"
                        onChange={handleExpensesChange}
                        checked={expenseFormData.splitType === "EQUAL"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Equal</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="splitType"
                        value="AMOUNT"
                        onChange={handleExpensesChange}
                        checked={expenseFormData.splitType === "AMOUNT"}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">Amount</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={expenseFormData.description}
                      placeholder="What was this expense for?"
                      onChange={handleExpensesChange}
                      className={`input ${
                        expensesFormErrors.description
                          ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                          : ""
                      }`}
                    />
                    {expensesFormErrors.description && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.description}
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
                      value={expenseFormData.amount}
                      placeholder="0.00"
                      min={"0"}
                      step={"0.01"}
                      onChange={handleExpensesChange}
                      className={`input ${
                        expensesFormErrors.amount
                          ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                          : ""
                      }`}
                    />
                    {expensesFormErrors.amount && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.amount}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                        value={expenseFormData.accountId}
                        onChange={handleExpensesChange}
                        className={`input`}
                      >
                        {accounts?.map((account, idx) => (
                          <option value={account.id} key={account.id}>
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
                  {categories?.length === 0 ? (
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
                    <div className="w-full">
                      <label
                        htmlFor="categoryId"
                        className="block text-sm font-medium text-gray-900 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="categoryId"
                        name="categoryId"
                        value={expenseFormData.categoryId}
                        onChange={handleExpensesChange}
                        className={`input`}
                      >
                        {categories?.map((cat, idx) => {
                          return (
                            <option value={cat.id} key={cat.id}>
                              {cat.iconUrl} {cat.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                      value={expenseFormData.date.toISOString().split("T")[0]}
                      onChange={handleChange}
                      className={`input ${
                        expensesFormErrors.date
                          ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                          : ""
                      }`}
                    />
                    {expensesFormErrors.date && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.date}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="userId"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Paid by
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={expenseFormData.userId}
                      onChange={handleExpensesChange}
                      className={`input`}
                    >
                      <option value="">Select Who Paid?</option>
                      {expenseFormData.splits?.map((user, idx) => {
                        return (
                          <option value={user.userId} key={user.userId}>
                            {user.name} {user.userId === dbUserId && "(You)"}
                          </option>
                        );
                      })}
                    </select>
                    {expensesFormErrors.userId && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.userId}
                      </p>
                    )}
                  </div>
                </div>
                {selectedExpenseType === "INDIVIDUAL" ? (
                  <div>
                    <label
                      htmlFor="memberIds"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Members
                    </label>
                    <div className="py-1 mb-2">
                      <div className="flex-1 relative">
                        <div className="pl-3 flex items-center pointer-events-none absolute left-0 inset-y-0">
                          <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search Users..."
                          onChange={handleSearchUsers}
                          className="pl-10 py-2 pr-4 border border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500 w-full z-10"
                        />
                      </div>
                      {isSearchingUsers ? (
                        <p className="text-gray-600 mt-2">Searching...</p>
                      ) : searchedUsers && searchedUsers.length > 0 ? (
                        <div className="max-h-28 overflow-y-auto">
                          {searchedUsers.map((user) => {
                            const isAlreadySelected =
                              hasAlreadyBeenSelectedForSplit(user.id);
                            const isCurrentUser = dbUserId === user.id;
                            return (
                              <div
                                className="flex items-center gap-2 p-2 hover:cursor-pointer"
                                key={user.id}
                              >
                                <input
                                  type="checkbox"
                                  id="memberId"
                                  name="memberId"
                                  checked={isAlreadySelected}
                                  onChange={() =>
                                    handleToggleOnSplitSelection(user)
                                  }
                                  className="border-gray-300 rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                                />
                                <img
                                  src={user?.profilePicUrl}
                                  className="w-6 h-6 rounded-full"
                                />{" "}
                                <p className="text-sm text-gray-900">
                                  {user.name} {isCurrentUser && "(You)"}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    {expensesFormErrors.selectedMembers && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.selectedMembers}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="groupId"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Groups
                    </label>
                    <select
                      id="groupId"
                      name="groupId"
                      value={expenseFormData.groupId || ""}
                      onChange={handleExpensesChange}
                      className={`input`}
                    >
                      <option value="">Select group</option>
                      {contacts?.groups?.map((group) => (
                        <option value={group.id} key={group.id}>
                          {group.name} ({group.members.length} members)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {expenseFormData.splits.length > 0 && (
                  <div className="border border-gray-200 p-2 rounded-lg">
                    <h3 className="text-gray-900 font-medium text-2xl mb-2">
                      Split Details
                    </h3>
                    {expenseFormData.splits.map((user, idx) => (
                      <div
                        className="flex justify-between mb-4"
                        key={user.userId}
                      >
                        <div
                          className="flex items-center space-x-2"
                          key={user.userId}
                        >
                          <img
                            src={user.profilePicUrl}
                            alt="Profile Picture"
                            className="w-6 h-6 rounded-full"
                          />
                          <p className="text-gray-900 text-sm font-medium">
                            {user.name} {user.userId === dbUserId && "(You)"}
                          </p>
                        </div>
                        {expenseFormData.splitType !== "EQUAL" && (
                          <>
                            {expenseFormData.splitType === "AMOUNT" ? (
                              <div className="w-24">
                                <input
                                  type="number"
                                  className="input py-1 px-2"
                                  value={user.splitAmount}
                                  placeholder="0.00"
                                  min={"0"}
                                  onChange={(e) =>
                                    handleSplitChange(
                                      user.userId,
                                      e.target.value,
                                      "AMOUNT"
                                    )
                                  }
                                />
                              </div>
                            ) : (
                              <div className="w-24">
                                <input
                                  type="number"
                                  className="input py-1 px-2"
                                  value={user.splitPercentage}
                                  placeholder="0.00"
                                  min={"0"}
                                  onChange={(e) =>
                                    handleSplitChange(
                                      user.userId,
                                      e.target.value,
                                      "PERCENTAGE"
                                    )
                                  }
                                />
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 text-sm">
                            ${user.splitAmount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({user.splitPercentage.toFixed(1)}%)
                          </span>
                          <button
                            type="button"
                            className="flex items-center"
                            onClick={() => handleToggleOffSplitSelection(user)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {expensesFormErrors.exceedingTotal && (
                      <p className="mt-1 text-error-600 text-sm">
                        {expensesFormErrors.exceedingTotal}
                      </p>
                    )}
                  </div>
                )}
                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleExpensesSubmit}
                  disabled={isSubmittingExpenses}
                >
                  {isSubmittingExpenses ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    "Add Expense"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Contacts Grid */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="sm:flex items-center justify-between">
            <h3 className="text-gray-900 font-semibold text-lg">People</h3>
            <button
              className="btn-secondary flex items-center mt-4 sm:mt-0"
              onClick={() => handleOpenExpensesModal("INDIVIDUAL")}
            >
              <PlusIcon size={18} className="mr-1" />
              Add Expense
            </button>
          </div>
          {contacts?.people.map((user) => (
            <Link
              href={`/person/${user?.id}`}
              key={user?.id}
              className="card flex space-x-2 p-4 items-center"
            >
              <img
                src={user?.profilePicUrl}
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <div>
                <p className="text-gray-900">{user?.name}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="space-y-4">
          <div className="sm:flex items-center justify-between">
            <h3 className="text-gray-900 font-semibold text-lg">Groups</h3>
            <button
              className="btn-secondary flex items-center mt-4 sm:mt-0"
              onClick={() => handleOpenExpensesModal("GROUP")}
            >
              <PlusIcon size={18} className="mr-1" />
              Add Expense
            </button>
          </div>
          {contacts?.groups?.map((group) => (
            <Link
              className="card flex space-x-2 p-4 items-center"
              key={group.id}
              href={`/group/${group.id}`}
            >
              <div className="bg-gray-200 p-2 rounded-lg">
                <UsersIcon size={18} />
              </div>
              <div>
                <p className="text-gray-900">{group?.name}</p>
                <p className="text-gray-600 text-sm">
                  {group.members.length} members
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsPageClient;
