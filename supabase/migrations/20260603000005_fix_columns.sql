-- ============================================================
-- Migration: Fix Deep Functionality Columns
-- Fixes the failed 20260603000004 migration + adds missing pieces
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. Savings transactions ──────────────────────────────────
ALTER TABLE public.savings_transactions
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- ── 2. Meeting attendance (table EXISTS — use correct column names) ──
-- Table has: id, meeting_id, member_id, attended, created_at
-- Add is_present as alias-compatible column + collection fields
ALTER TABLE public.meeting_attendance
  ADD COLUMN IF NOT EXISTS is_present BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS collected_amount NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_collection_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sync existing 'attended' values into 'is_present'
UPDATE public.meeting_attendance SET is_present = attended WHERE is_present IS NULL;

-- ── 3. Grant applications ────────────────────────────────────
ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS amount_requested NUMERIC(15,2);

-- ── 4. Skill enrollments ─────────────────────────────────────
ALTER TABLE public.skill_enrollments
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

-- ── 5. Loans ─────────────────────────────────────────────────
-- repayment_frequency already exists in loans table (from 20260603000002)
-- approved_by already exists referencing public.profiles
-- Add rejection_reason and approved_at only
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ── 6. Marketplace products ──────────────────────────────────
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_contact TEXT,
  ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0;

-- ── 7. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_savings_accounts_member ON public.savings_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_shg    ON public.savings_accounts(shg_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan    ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_meeting ON public.meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_member  ON public.meeting_attendance(member_id);

-- ── 8. Auto-create member savings account on member join ─────
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

-- ── 9. Add certificate_on_completion to skill_programs ───────
ALTER TABLE public.skill_programs
  ADD COLUMN IF NOT EXISTS certificate_on_completion BOOLEAN DEFAULT TRUE;

-- ── Done ─────────────────────────────────────────────────────
SELECT 'Migration 20260603000005_fix_columns applied successfully' AS status;
