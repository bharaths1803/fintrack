"use client";

import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Loader,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getGroupExpenses } from "../../../../actions/group.actions";
import { useState } from "react";
import { Settlement } from "../../../../types";
import { createSettlement } from "../../../../actions/settlement.actions";
import toast from "react-hot-toast";

type GroupDataType = Awaited<ReturnType<typeof getGroupExpenses>>;

interface GroupClientPageProps {
  dbUserId: string;
  groupData: GroupDataType;
}

const GroupClientPage = ({ dbUserId, groupData }: GroupClientPageProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "SETTLEMENTS">(
    "EXPENSES"
  );

  const myDetails = groupData?.allMembersBalances?.find(
    (b) => b.id === dbUserId
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<Omit<Settlement, "id">>({
    sentUserId: "",
    receivedUserId: "",
    amount: 0,
    note: "",
    date: new Date(),
    groupId: groupData?.groupDetails.id,
  });

  const handleOpenModal = () => {
    setFormData({
      sentUserId: "",
      receivedUserId: "",
      amount: 0,
      note: "",
      date: new Date(),
      groupId: groupData?.groupDetails.id,
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
      errors.sentUserId = "Select who paid.";
    }
    if (!formData.receivedUserId.trim()) {
      errors.receivedUserId = "Select who received.";
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
      <div className="mt-4 sm:mt-0 sm:flex justify-between items-start">
        <div className="flex space-x-4 items-center">
          <button
            className="text-gray-600 hover:cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h2 className="text-2xl text-gray-900">
              {groupData?.groupDetails.name}
            </h2>
            <h3 className="text-sm text-gray-400 font-light">
              Created on{" "}
              {groupData?.groupDetails.createdAt?.toLocaleDateString()}
            </h3>
          </div>
          <div className="p-2 bg-gray-200 rounded-md text-sm">
            {groupData?.allMembersBalances?.length} members
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
                  <label
                    htmlFor="sentUserId"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Select Who Paid?
                  </label>
                  <select
                    id="sentUserId"
                    name="sentUserId"
                    value={formData.sentUserId}
                    onChange={handleChange}
                    className={`input`}
                  >
                    <option value="">Select payer</option>
                    {groupData?.groupDetails.members?.map((m) => {
                      if (
                        m.id !== formData.receivedUserId &&
                        (dbUserId === groupData.groupDetails.adminId ||
                          dbUserId === m.id)
                      )
                        return (
                          <option value={m.id} key={m.id}>
                            {m.name} {m.id === dbUserId && "(You)"}
                          </option>
                        );
                    })}
                  </select>
                  {formErrors.sentUserId && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.sentUserId}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="receiverUserId"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Select Who Received?
                  </label>
                  <select
                    id="receivedUserId"
                    name="receivedUserId"
                    value={formData.receivedUserId}
                    onChange={handleChange}
                    className={`input`}
                  >
                    <option value="">Select Receiver</option>
                    {groupData?.groupDetails.members?.map((m) => {
                      if (m.id !== formData.sentUserId)
                        return (
                          <option value={m.id} key={m.id}>
                            {m.name} {m.id === dbUserId && "(You)"}
                          </option>
                        );
                    })}
                  </select>
                  {formErrors.receivedUserId && (
                    <p className="mt-1 text-error-600 text-sm">
                      {formErrors.receivedUserId}
                    </p>
                  )}
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
      <div className="card p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-semibold text-gray-900">
            ${groupData?.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Settled Amount</h3>
          <p className="text-2xl font-semibold text-success-600">
            ${groupData?.totalSettlements.toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Pending Amount</h3>
          <p className="text-2xl font-semibold text-warning-600">
            $
            {Math.abs(
              (groupData?.totalExpenses || 0) -
                (groupData?.totalSettlements || 0)
            ).toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="text-gray-500 font-medium text-sm">Your balance</h3>
          <div
            className={`${(groupData?.netBalances[dbUserId] || 0) > 0 ? "text-success-600" : "text-error-600"} flex items-center`}
          >
            {(groupData?.netBalances[dbUserId] || 0) > 0 ? (
              <>
                <ArrowUpRight size={24} className="mr-1" />
                <span className="text-2xl font-bold">
                  ${groupData?.netBalances[dbUserId].toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <ArrowDownLeft size={24} className="mr-1" />
                <span className="text-2xl font-bold">
                  ${Math.abs(groupData?.netBalances[dbUserId] || 0).toFixed(2)}
                </span>
              </>
            )}
          </div>
          <span className="text-gray-500 text-sm font-light">
            {(groupData?.netBalances[dbUserId] || 0) > 0
              ? "owes you"
              : "you owe"}
          </span>
        </div>
      </div>

      {/* My Expenses Summary */}

      <div className="card p-6">
        <h2 className="font-semibold text-lg text-gray-900">Member balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          {myDetails?.owesTo && myDetails.owesTo.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-5">
                You owe
              </h3>
              <div className="space-y-4">
                {myDetails?.owesTo.map((m) => (
                  <div
                    key={m.owesToId}
                    className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          groupData?.memberDetailsMappingWithId[m.owesToId]
                            .profilePicUrl
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-gray-900 ">
                          {
                            groupData?.memberDetailsMappingWithId[m.owesToId]
                              .name
                          }
                        </h3>
                        <p className="text-gray-500 text-sm ">
                          {
                            groupData?.memberDetailsMappingWithId[m.owesToId]
                              .email
                          }
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-error-600 text-lg font-semibold">
                        ${m.owesToAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {myDetails?.owesFrom && myDetails.owesFrom.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-5">
                You are owed
              </h3>
              <div className="space-y-4">
                {myDetails?.owesFrom.map((m) => (
                  <div
                    key={m.owesFromId}
                    className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          groupData?.memberDetailsMappingWithId[m.owesFromId]
                            .profilePicUrl
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-gray-900 ">
                          {
                            groupData?.memberDetailsMappingWithId[m.owesFromId]
                              .name
                          }
                        </h3>
                        <p className="text-gray-500 text-sm ">
                          {
                            groupData?.memberDetailsMappingWithId[m.owesFromId]
                              .email
                          }
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-error-600 text-lg font-semibold">
                        ${m.owesFromAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Members  Summary*/}

      <div className="card p-6">
        <h2 className="text-lg text-gray-900 font-semibold mb-4">
          Member details
        </h2>
        <div className="space-y-4">
          {groupData?.allMembersBalances?.map((m) => (
            <div className="flex justify-between" key={m.id}>
              <div className="flex items-center space-x-3">
                <img
                  src={m.profilePicUrl}
                  alt="Profile"
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <h3 className="text-gray-900 font-medium">
                    {m.name}{" "}
                    {m.id === groupData.groupDetails.adminId && "(Admin)"}
                  </h3>
                  <p className="text-gray-500 text-sm">{m.email}</p>
                </div>
              </div>
              <div
                className={`${groupData.netBalances[m.id] > 0 ? "text-success-500" : "text-error-500"} text-right`}
              >
                <div className={"flex items-center"}>
                  {groupData.netBalances[m.id] > 0 ? (
                    <ArrowUpRight size={18} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={18} className="mr-1" />
                  )}
                  ${Math.abs(groupData.netBalances[m.id]).toFixed(2)}
                </div>
                <p className="text-sm">
                  {groupData.netBalances[m.id] > 0 ? "to receive" : "to pay"}
                </p>
              </div>
            </div>
          ))}
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

      {/* Group Expenses */}
      {activeTab === "EXPENSES"
        ? groupData?.expenses.map((e) => (
            <div className="card p-6" key={e.id}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{e.description}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(e.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${e.amount.toFixed(2)}
                  </p>
                  <span className="text-sm text-gray-500">
                    {e.userId === dbUserId
                      ? "You paid"
                      : `Paid by ${e.paidByUser.name}`}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Shares
                </h4>
                <div className="space-y-2">
                  {e.splits.map((s, idx) => (
                    <div
                      className="text-sm flex items-center justify-between"
                      key={idx}
                    >
                      <p className=" text-gray-600">{s.user.name}</p>
                      <p className="font-medium">${s.splitAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        : groupData?.settlements.map((s) => (
            <div className="card p-4 flex justify-between" key={s.id}>
              <div>
                <h2 className="text-gray-900 text-xl">{s.note}</h2>
                <span className="text-gray-600 font-light text-sm">
                  {new Date(s.date).toLocaleDateString()}
                </span>
              </div>

              <div className="text-right">
                <h2 className="text-gray-900 text-xl">
                  ${s.amount.toFixed(2)}
                </h2>
                <p className={"text-success-500  font-light text-sm"}>
                  {`${s.sentUserId !== dbUserId ? groupData.memberDetailsMappingWithId[s.sentUserId].name : "You"} paid ${s.receivedUserId !== dbUserId ? groupData.memberDetailsMappingWithId[s.receivedUserId].name : "You"}`}
                </p>
              </div>
            </div>
          ))}
    </div>
  );
};

export default GroupClientPage;
