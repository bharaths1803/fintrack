export interface Category {
  id: string;
  type: "INCOME" | "EXPENSE";
  name: string;
  iconUrl: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  selectedMembers: Member[];
}

export interface Member {
  id: string;
  name: string;
  profilePicUrl: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  note: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  isCompleted?: boolean;
  reminderDays?: number | null;
}

export interface TransactionWithCategory extends Transaction {
  categoryId: string;
  accountId?: string | null;
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  amount: number;
}

export interface BudgetWithCategory extends Budget {
  categoryId: string | null;
}

export interface Account {
  id: string;
  accountName: string;
  currentBalance: number;
  isDefault: boolean;
}

export interface FilterOptions {
  type: "ALL" | "EXPENSE" | "INCOME";
  searchTerm: string;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
  accountId: string | null;
}

export interface FilterOptionsBudgets {
  month: number;
  year: number;
}

export interface FilterOptionsDashboardData {
  month: number;
  year: number;
  accountId: string | null;
}

export interface SharedExpense {
  id: string;
  splitType: "PERCENTAGE" | "AMOUNT" | "EQUAL";
  amount: number;
  description: string;
  userId: string;
  isSettled: boolean;
  groupId?: string | null;
  splits: Split[];
  categoryId: string;
  accountId: string;
  date: Date;
}

export interface Split {
  hasAlreadyPaid: boolean;
  splitAmount: number;
  userId: string;
  name: string;
  profilePicUrl: string;
  splitPercentage: number;
}
