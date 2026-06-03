-- 1. Enums
CREATE TYPE shg_status AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'CLOSED');
CREATE TYPE account_status AS ENUM ('PENDING', 'ACTIVE', 'DORMANT', 'CLOSED');
CREATE TYPE loan_status AS ENUM ('SUBMITTED', 'APPROVED', 'ACTIVE', 'CLOSED_OBLIGATIONS_MET', 'DEFAULTED');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'DISBURSEMENT', 'REPAYMENT', 'INTEREST_ACCRUAL', 'FEE', 'PENALTY', 'WAIVER');

-- 2. Organizations & Group Management
CREATE TABLE public.shgs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    formation_date DATE NOT NULL,
    registration_number VARCHAR(100),
    status shg_status DEFAULT 'PENDING'::shg_status,
    meeting_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    joined_date DATE NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE,
    status account_status DEFAULT 'ACTIVE'::account_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Savings Architecture
CREATE TABLE public.savings_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE, -- NULL if it's the group pool
    account_number VARCHAR(50) UNIQUE NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    mandatory_deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    status account_status DEFAULT 'ACTIVE'::account_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.savings_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    reference_id VARCHAR(100), -- Receipt or bank ref
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 4. Loan Portfolio Management
CREATE TABLE public.loan_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_principal NUMERIC(15, 2) NOT NULL,
    max_principal NUMERIC(15, 2) NOT NULL,
    annual_interest_rate NUMERIC(5, 2) NOT NULL,
    interest_method VARCHAR(50) DEFAULT 'DECLINING_BALANCE', -- FLAT or DECLINING_BALANCE
    repayment_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.loan_products(id) ON DELETE RESTRICT,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE, -- NULL for group loans
    loan_account_number VARCHAR(50) UNIQUE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    approved_amount NUMERIC(15, 2),
    outstanding_principal NUMERIC(15, 2) NOT NULL,
    outstanding_interest NUMERIC(15, 2) DEFAULT 0.00,
    status loan_status DEFAULT 'SUBMITTED'::loan_status,
    submitted_on_date DATE NOT NULL,
    approved_on_date DATE,
    disbursed_on_date DATE,
    expected_maturity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.loan_repayment_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    principal_completed NUMERIC(15, 2) DEFAULT 0.00,
    interest_amount NUMERIC(15, 2) NOT NULL,
    interest_completed NUMERIC(15, 2) DEFAULT 0.00,
    fee_amount NUMERIC(15, 2) DEFAULT 0.00,
    fee_completed NUMERIC(15, 2) DEFAULT 0.00,
    penalty_amount NUMERIC(15, 2) DEFAULT 0.00,
    penalty_completed NUMERIC(15, 2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.loan_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    principal_portion NUMERIC(15, 2) DEFAULT 0.00,
    interest_portion NUMERIC(15, 2) DEFAULT 0.00,
    fee_portion NUMERIC(15, 2) DEFAULT 0.00,
    penalty_portion NUMERIC(15, 2) DEFAULT 0.00,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    reference_id VARCHAR(100),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. General Ledger (Double-Entry)
CREATE TABLE public.journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL, -- Ties debits/credits together
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL, -- e.g., 'CASH', 'LOAN_PORTFOLIO', 'SAVINGS_LIABILITY'
    is_debit BOOLEAN NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Indexes for performance
CREATE INDEX idx_members_shg_id ON public.members(shg_id);
CREATE INDEX idx_savings_shg_id ON public.savings_accounts(shg_id);
CREATE INDEX idx_loans_shg_id ON public.loans(shg_id);
CREATE INDEX idx_loan_schedules_loan_id ON public.loan_repayment_schedules(loan_id);
CREATE INDEX idx_journal_entries_shg_id ON public.journal_entries(shg_id);

-- Row Level Security (RLS)
ALTER TABLE public.shgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Allow read access to SHG members
CREATE POLICY "Members can view their SHGs" ON public.shgs FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.members WHERE members.shg_id = shgs.id AND members.profile_id = auth.uid()));

CREATE POLICY "Members can view their SHG members" ON public.members FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.members m2 WHERE m2.shg_id = members.shg_id AND m2.profile_id = auth.uid()));

CREATE POLICY "Members can view their SHG savings" ON public.savings_accounts FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.members WHERE members.shg_id = savings_accounts.shg_id AND members.profile_id = auth.uid()));

CREATE POLICY "Members can view their SHG loans" ON public.loans FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.members WHERE members.shg_id = loans.shg_id AND members.profile_id = auth.uid()));
