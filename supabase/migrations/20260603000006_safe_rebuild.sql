-- ============================================================
-- Migration: Safe Rebuild & Columns Fix
-- This handles the case where earlier migrations failed or were skipped.
-- It ensures ALL tables exist, and ALL necessary columns exist.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ── 1. ENSURE ALL TABLES EXIST (from 000002) ──────────────────

CREATE TABLE IF NOT EXISTS public.loan_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_principal NUMERIC(15, 2) DEFAULT 500,
    max_principal NUMERIC(15, 2) DEFAULT 100000,
    interest_rate_per_period NUMERIC(5, 2) DEFAULT 2.0,
    repayment_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    min_repayment_periods INTEGER DEFAULT 1,
    max_repayment_periods INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    loan_product_id UUID REFERENCES public.loan_products(id) ON DELETE SET NULL,
    loan_account_number VARCHAR(50) UNIQUE,
    principal_amount NUMERIC(15, 2) NOT NULL,
    outstanding_principal NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    repayment_periods INTEGER NOT NULL,
    repayment_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    disbursement_date DATE,
    expected_closure_date DATE,
    purpose TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loan_repayments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
    installment_number INTEGER,
    due_date DATE,
    paid_date DATE,
    principal_due NUMERIC(15, 2) DEFAULT 0,
    interest_due NUMERIC(15, 2) DEFAULT 0,
    principal_paid NUMERIC(15, 2) DEFAULT 0,
    interest_paid NUMERIC(15, 2) DEFAULT 0,
    penalty_due NUMERIC(15, 2) DEFAULT 0,
    penalty_paid NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    meeting_type VARCHAR(30) DEFAULT 'REGULAR',
    agenda TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    conducted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meeting_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (meeting_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.skill_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    duration_weeks INTEGER DEFAULT 4,
    provider VARCHAR(200),
    is_free BOOLEAN DEFAULT TRUE,
    fee NUMERIC(10, 2) DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    certificate_on_completion BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES public.skill_programs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ENROLLED',
    UNIQUE (program_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.grant_schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    eligibility TEXT,
    max_amount NUMERIC(15, 2),
    provider VARCHAR(200),
    application_url TEXT,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grant_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheme_id UUID REFERENCES public.grant_schemes(id) ON DELETE CASCADE,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    applied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'APPLIED',
    notes TEXT,
    amount_approved NUMERIC(15, 2),
    amount_requested NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price_per_unit NUMERIC(10, 2),
    unit VARCHAR(50) DEFAULT 'piece',
    quantity_available INTEGER DEFAULT 0,
    image_url TEXT,
    whatsapp_contact TEXT,
    total_sold INTEGER DEFAULT 0,
    is_listed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 2. ENSURE DEEP FUNCTIONALITY COLUMNS EXIST (from 000005) ──

ALTER TABLE public.savings_transactions
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

ALTER TABLE public.meeting_attendance
  ADD COLUMN IF NOT EXISTS is_present BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS collected_amount NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_collection_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sync attended back to is_present if missing
UPDATE public.meeting_attendance SET is_present = attended WHERE is_present IS NULL;

ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS amount_requested NUMERIC(15,2);

ALTER TABLE public.skill_enrollments
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_contact TEXT,
  ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0;


-- ── 3. ENABLE ROW LEVEL SECURITY ─────────────────────────────
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;


-- ── 4. INDEXES & TRIGGERS ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_savings_accounts_member ON public.savings_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_shg    ON public.savings_accounts(shg_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan    ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_meeting ON public.meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_member  ON public.meeting_attendance(member_id);

CREATE OR REPLACE FUNCTION public.create_member_savings_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.savings_accounts
    WHERE member_id = NEW.id AND shg_id = NEW.shg_id
  ) THEN
    INSERT INTO public.savings_accounts(shg_id, member_id, account_type, balance)
    VALUES (NEW.shg_id, NEW.id, 'MEMBER', 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_member_savings_account ON public.members;
CREATE TRIGGER trg_member_savings_account
  AFTER INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.create_member_savings_account();

SELECT 'Migration 20260603000006_safe_rebuild applied successfully' AS status;
