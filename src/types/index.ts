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
}

export interface TransactionWithCategory extends Transaction {
  categoryId: string;
}

export interface FilterOptions {
  type: "ALL" | "EXPENSE" | "INCOME";
  searchTerm: string;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
}
