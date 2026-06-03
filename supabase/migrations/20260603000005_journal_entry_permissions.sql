-- ============================================================
-- Migration: Journal Entry Policies & Double-Entry Accounting
-- ============================================================

-- Ensure RLS is active on journal entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop any potential policies on journal entries
DROP POLICY IF EXISTS "Journal Entries Select Policy" ON public.journal_entries;
DROP POLICY IF EXISTS "Journal Entries Insert Policy" ON public.journal_entries;

-- Re-create simple, non-recursive RLS rules
CREATE POLICY "Journal Entries Select Policy" ON public.journal_entries
    FOR SELECT USING (public.is_shg_member(shg_id));

CREATE POLICY "Journal Entries Insert Policy" ON public.journal_entries
    FOR INSERT WITH CHECK (public.is_shg_leader(shg_id));
