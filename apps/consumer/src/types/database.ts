export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ───────────────────────────────────────────────────────────────────
export type ShgStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "CLOSED";
export type AccountStatus = "PENDING" | "ACTIVE" | "DORMANT" | "CLOSED";
export type LoanStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "ACTIVE"
  | "CLOSED_OBLIGATIONS_MET"
  | "DEFAULTED";
export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "DISBURSEMENT"
  | "REPAYMENT"
  | "INTEREST_ACCRUAL"
  | "FEE"
  | "PENALTY"
  | "WAIVER";

// ─── Database Schema Types ────────────────────────────────────────────────────
export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  status: "PENDING" | "VERIFIED" | "FAILED";
  created_at: string;
  updated_at: string;
}

export interface SHG {
  id: string;
  name: string;
  formation_date: string;
  registration_number: string | null;
  status: ShgStatus;
  meeting_frequency: string;
  bank_name: string | null;
  bank_account_number: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  shg_id: string;
  profile_id: string | null;
  joined_date: string;
  is_leader: boolean;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsAccount {
  id: string;
  shg_id: string;
  member_id: string | null;
  account_number: string;
  balance: number;
  mandatory_deposit_amount: number;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  account_id: string;
  transaction_type: TransactionType;
  amount: number;
  transaction_date: string;
  reference_id: string | null;
  created_by: string | null;
}

export interface LoanProduct {
  id: string;
  name: string;
  description: string | null;
  min_principal: number;
  max_principal: number;
  annual_interest_rate: number;
  interest_method: string;
  repayment_frequency: string;
  created_at: string;
}

export interface Loan {
  id: string;
  product_id: string;
  shg_id: string;
  member_id: string | null;
  loan_account_number: string;
  principal_amount: number;
  approved_amount: number | null;
  outstanding_principal: number;
  outstanding_interest: number;
  status: LoanStatus;
  submitted_on_date: string;
  approved_on_date: string | null;
  disbursed_on_date: string | null;
  expected_maturity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRepaymentSchedule {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  principal_completed: number;
  interest_amount: number;
  interest_completed: number;
  fee_amount: number;
  fee_completed: number;
  penalty_amount: number;
  penalty_completed: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoanTransaction {
  id: string;
  loan_id: string;
  transaction_type: TransactionType;
  amount: number;
  principal_portion: number;
  interest_portion: number;
  fee_portion: number;
  penalty_portion: number;
  transaction_date: string;
  reference_id: string | null;
  created_by: string | null;
}

export interface JournalEntry {
  id: string;
  transaction_id: string;
  shg_id: string;
  account_name: string;
  is_debit: boolean;
  amount: number;
  entry_date: string;
  description: string | null;
}
