"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Loader,
  Plus,
  X,
} from "lucide-react";
import { getExpensesBetweenUsers } from "../../../../actions/expense.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Settlement } from "../../../../types";
import { createSettlement } from "../../../../actions/settlement.actions";
import toast from "react-hot-toast";

type PersonData = Awaited<ReturnType<typeof getExpensesBetweenUsers>>;

interface PersonClientPageProps {
  personData: PersonData;
  dbUserId: string;
}

const PersonClientPage = ({ personData, dbUserId }: PersonClientPageProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "SETTLEMENTS">(
    "EXPENSES"
  );
  const date = new Date(personData?.expenses?.[0].date as Date);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState<boolean>(false);
  const [selectedExpenseType, setSelectedExpenseType] =
    useState<string>("INDIVIDUAL");

  const [showExpensesModal, setShowExpensesModal] = useState<boolean>(false);
  const [isSubmittingExpenses, setIsSubmittingExpenses] =
    useState<boolean>(false);

  const [formData, setFormData] = useState<Omit<Settlement, "id">>({
    sentUserId: dbUserId,
    receivedUserId: personData?.otherUser?.id || "",
    amount: 0,
    note: "",
    date: new Date(),
  });

  const handleOpenModal = () => {
    setFormData({
      sentUserId: dbUserId,
      receivedUserId: personData?.otherUser?.id || "",
      amount: 0,
      note: "",
      date: new Date(),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.sentUserId.trim()) {
      errors.name = "Select who paid.";
    }
    if (!formData.receivedUserId.trim()) {
      errors.iconUrl = "Select who received.";
    }
    if (!formData.amount) {
      errors.selectedMembers = "Amount is required.";
    }
    if (!formData.note) {
      errors.note = "Add a description.";
    }
    if (!formData.date) {
      errors.date = "Date is required.";
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
      const res = await createSettlement(formData);
      handleCloseModal();
      if (res?.success) toast.success(`Settled successfully!`);
      else throw new Error(res?.error as string);
    } catch (error) {
      toast.error(`Failed to settle!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex space-x-4 items-center">
          <button
            className="text-gray-600 hover:cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h2 className="text-2xl text-gray-900">
              {personData?.otherUser?.name}
            </h2>
            <h3 className="text-sm text-gray-400 font-light">
              {personData?.otherUser?.email}
            </h3>
          </div>
        </div>
        <button
          className="flex items-center btn-primary mt-4 sm:mt-0"
          onClick={handleOpenModal}
        >
          <Plus size={18} className="mr-1" />
          Settle up
        </button>
      </div>

      {showModal && (
        <>
          <div className="z-40 h-full fixed inset-0 bg-black opacity-50" />
          <div className="fixed inset-0 z-50 flex justify-center items-center">
            <div className="max-w-md bg-white rounded-lg shadow-xl w-full animate-scale z-50">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-gray-900 text-xl font-semibold">
                  Settle up
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
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Who Paid?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sentUserId"
                        value={dbUserId}
                        onChange={handleChange}
                        checked={formData.sentUserId === dbUserId}
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">
                        You Paid {personData?.otherUser?.name}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sentUserId"
                        value={personData?.otherUser?.id}
                        onChange={handleChange}
                        checked={
                          formData.sentUserId === personData?.otherUser?.id
                        }
                        className="size-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 ml-2">
                        {personData?.otherUser?.name} Paid You
                      </span>
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

                <button
                  className="btn-primary w-full p-2 flex items-center justify-center"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader size={18} className="mr-1 animate-spin" />
                  ) : (
                    "Settle up"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Summary Card */}
      <div className="card p-6 grid grid-cols-1 md:grid-cols-3 space-y-6 md:space-y-0">
        <div className="space-y-1">
          <h3 className="text-gray-500 font-medium text-sm">Current balance</h3>
          <div
            className={`${(personData?.balance || 0) > 0 ? "text-success-600" : "text-error-600"} flex items-center`}
          >
            {(personData?.balance || 0) > 0 ? (
              <>
                <ArrowUpRight size={24} className="mr-1" />
                <span className="text-2xl font-bold">
                  ${personData?.balance.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <ArrowDownLeft size={24} className="mr-1" />
                <span className="text-2xl font-bold">
                  ${Math.abs(personData?.balance || 0).toFixed(2)}
                </span>
              </>
            )}
          </div>
          <span className="text-gray-500 text-sm font-light">
            {(personData?.balance || 0) > 0 ? "owes you" : "you owe"}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-gray-500 font-medium text-sm">All Expenses</h3>
          <span
            className={`text-gray-900 flex items-center text-2xl font-bold`}
          >
            ${personData?.totalExpenses.toFixed(2)}
          </span>
          <span className="text-gray-500 text-sm font-light">
            across all transactions
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-gray-500 font-medium text-sm">Last Activity</h3>
          <span
            className={`text-gray-900 flex items-center text-2xl font-bold`}
          >
            {date.toLocaleDateString()}
          </span>
          <span className="text-gray-500 text-sm font-light">
            most recent transaction
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            className={`border-b-2 font-medium text-sm py-4 px-1 ${activeTab === "EXPENSES" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            onClick={() => setActiveTab("EXPENSES")}
          >
            Expenses
          </button>
          <button
            className={`border-b-2 font-medium text-sm py-4 px-1 ${activeTab === "SETTLEMENTS" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            onClick={() => setActiveTab("SETTLEMENTS")}
          >
            Settlements
          </button>
        </nav>
      </div>

      {/* Settlements or Expenses */}
      {activeTab === "EXPENSES" ? (
        <div className="space-y-4">
          {personData?.expenses.map((e) => (
            <div className="card p-4 flex justify-between" key={e.id}>
              <div>
                <h2 className="text-gray-900 text-xl">{e.description}</h2>
                <span className="text-gray-600 font-light text-sm">
                  {new Date(e.date).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h2 className="text-gray-900 text-xl">
                  ${e.amount.toFixed(2)}
                </h2>
                <p
                  className={`${e.userId === personData.otherUser?.id ? "text-gray-600" : "text-success-500"}  font-light text-sm`}
                >
                  {e.userId === personData.otherUser?.id
                    ? `${personData.otherUser.name} paid`
                    : `You paid`}
                </p>
                <span className="text-gray-600 font-light text-sm mt-2">
                  Your share: $
                  {e.splits
                    .find((s) => s.userId === dbUserId)
                    ?.splitAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {personData?.settlements.map((s) => (
            <div className="card p-4 flex justify-between" key={s.id}>
              <div>
                <h2 className="text-gray-900 text-xl">{s.note}</h2>
                <span className="text-gray-600 font-light text-sm">
                  {new Date(s.date).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h2 className="text-gray-900 text-xl">
                  ${s.amount.toFixed(2)}
                </h2>
                <p
                  className={`${s.sentUserId === dbUserId ? "text-error-600" : "text-success-500"}  font-light text-sm`}
                >
                  {s.receivedUserId === dbUserId
                    ? `${personData.otherUser?.name} paid`
                    : `You paid`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonClientPage;
