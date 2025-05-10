export interface Category {
  id: string;
  type: "INCOME" | "EXPENSE";
  name: string;
  iconUrl: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  note: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
}

export interface TransactionWithCategory extends Transaction {
  categoryId: string;
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

export interface FilterOptions {
  type: "ALL" | "EXPENSE" | "INCOME";
  searchTerm: string;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface FilterOptionsBudgets {
  month: number;
  year: number;
}

export interface FilterOptionsDashboardData {
  month: number;
  year: number;
}
