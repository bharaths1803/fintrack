"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Edit2,
  Loader,
  Plus,
  Star,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../../../../actions/account.action";
import { useState } from "react";
import { Account } from "../../../../types";
import toast from "react-hot-toast";

type Accounts = Awaited<ReturnType<typeof getAccounts>>;

interface AccountsPageClientProps {
  accounts: Accounts;
}

const AccountsPageClient = ({ accounts }: AccountsPageClientProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDefaultAccount, setIsDefaultAccount] = useState<boolean>(false);

  const [formData, setFormData] = useState<Omit<Account, "id">>({
    accountName: "",
    currentBalance: 0,
    isDefault: true,
  });

  const [editingAccountId, setEditingAccountId] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setFormData({
        accountName: account.accountName,
        currentBalance: account.currentBalance,
        isDefault: account.isDefault,
      });
      setIsDefaultAccount(account.isDefault);
      setShowEditModal(true);
      setEditingAccountId(account.id);
    } else {
      setFormData({
        accountName: "",
        currentBalance: 0,
        isDefault: true,
      });
      setEditingAccountId("");
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowEditModal(false);
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
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.accountName.trim()) {
      errors.note = "Account name is required.";
    }
    if (!formData.currentBalance) {
      errors.currentBalance = "Balance amount is required.";
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
      };
      formValues.currentBalance = Number(formValues.currentBalance);
      if (showEditModal)
        await updateAccount({ ...formValues, id: editingAccountId });
      else await createAccount(formValues);
      handleCloseModal();
      toast.success(
        `${editingAccountId ? "Edited" : "Added"} account successfully!`
      );
      setEditingAccountId("");
    } catch (error) {
      toast.error(`Failed to ${editingAccountId ? "edit" : "add"} account!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = (account: Account) => {
    setDeletingAccount(account);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    try {
      setIsDeleting(true);
      await deleteAccount(deletingAccount?.id);
      handleCloseDeleteModal();
      toast.success("Deleted transaction successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex items-center justify-between">
        <h1 className="text-gray-900 font-bold text-2xl">Accounts</h1>
        <button
          className="flex items-center btn-primary mt-4 sm:mt-0"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} className="mr-1" />
          Add Account
        </button>
      </div>

      {/* Add Or Update Account */}
      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  {showEditModal ? "Update Account" : "Add Account"}
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
                    htmlFor="accountName"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    placeholder="e.g., Cash HDFC Bank"
                    onChange={handleChange}
                    className={`input ${
                      formErrors.accountName
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.accountName && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.accountName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="currentBalance"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Current Balance
                  </label>
                  <input
                    type="number"
                    id="currentBalance"
                    name="currentBalance"
                    value={formData.currentBalance}
                    placeholder="0.00"
                    min={"0"}
                    step={"0.01"}
                    onChange={handleChange}
                    disabled={!!editingAccountId}
                    className={`input ${
                      formErrors.currentBalance
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500"
                        : ""
                    }`}
                  />
                  {formErrors.currentBalance && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.currentBalance}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="border-gray-300 rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    disabled={!!editingAccountId && isDefaultAccount}
                  />
                  <label
                    htmlFor="isCompleted"
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    Default
                  </label>
                </div>

                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : showEditModal ? (
                    "Update Account"
                  ) : (
                    "Add Account"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((account, idx) => (
          <div
            className="p-6 bg-white border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            key={idx}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full text-primary-600 bg-primary-200">
                  <Wallet size={24} />
                </div>
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {account.accountName}
                  </h3>
                  {account.isDefault && (
                    <Star
                      size={24}
                      className="ml-2 text-accent-500 fill-current"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-2 items-center">
                <button
                  className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                  onClick={() => handleOpenModal(account)}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="text-gray-400 hover:text-error-500 transition-colors hover:cursor-pointer"
                  onClick={() => handleOpenDeleteModal(account)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Current Balance</span>
                <span
                  className={`font-semibold ${account.currentBalance >= 0 ? "text-success-600" : "text-error-600"}`}
                >
                  ${account.currentBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Income</span>
                <div
                  className={"flex items-center font-semibold text-success-600"}
                >
                  <ArrowUpRight size={16} className="mr-1" />$
                  {account.income.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Expense</span>
                <div
                  className={"flex items-center font-semibold text-error-600"}
                >
                  <ArrowDownRight size={16} className="mr-1" />$
                  {account.expense.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Delete Account
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleCloseDeleteModal}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 text-lg font-semibold p-4">
                Are you sure you want to delete account "
                {deletingAccount?.accountName}"?
              </p>
              <p className="text-warning-600 px-4 text-sm font-medium">
                Warning: This will delete all transactions in this account
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

export default AccountsPageClient;
