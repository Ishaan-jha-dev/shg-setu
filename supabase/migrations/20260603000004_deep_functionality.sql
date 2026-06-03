-- ============================================================
-- Migration: Deep Functionality Additions
-- Adds missing columns needed for full feature completeness
-- ============================================================

-- 1. Savings transactions: add notes + recorded_by
ALTER TABLE public.savings_transactions
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- 2. Meeting attendance: add savings collection fields
ALTER TABLE public.meeting_attendance
  ADD COLUMN IF NOT EXISTS collected_amount NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_collection_done BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Grant applications: add notes + requested amount
ALTER TABLE public.grant_applications
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS amount_requested NUMERIC(15,2);

-- 4. Skill enrollments: add completion_date
ALTER TABLE public.skill_enrollments
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

-- 5. Loans: add repayment_frequency if missing + approval fields
ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS repayment_frequency VARCHAR(20) DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 6. Members: per-member savings account link
-- Ensure savings_accounts has member_id index
CREATE INDEX IF NOT EXISTS idx_savings_accounts_member ON public.savings_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_shg ON public.savings_accounts(shg_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON public.loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_meeting ON public.meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_member ON public.meeting_attendance(member_id);

-- 7. Marketplace products: add image_url + whatsapp_contact
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_contact TEXT,
  ADD COLUMN IF NOT EXISTS total_sold INTEGER DEFAULT 0;

-- 8. RLS for new columns (inherit from existing table policies)
-- No new tables, just column additions — existing RLS covers them.

-- 9. Helper: get next meeting date for a SHG
CREATE OR REPLACE FUNCTION public.get_next_meeting(p_shg_id UUID)
RETURNS DATE AS $$
  SELECT meeting_date::DATE
  FROM public.meetings
  WHERE shg_id = p_shg_id
    AND status = 'SCHEDULED'
    AND meeting_date >= CURRENT_DATE
  ORDER BY meeting_date ASC
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 10. Per-member savings account auto-creation trigger
CREATE OR REPLACE FUNCTION public.create_member_savings_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a personal savings account for new member if not exists
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
