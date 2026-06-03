-- ============================================================
-- Migration: Fix RLS Policies and Infinite Recursion
-- ============================================================

-- 1. Create SECURITY DEFINER helpers to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_shg_member(shg_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members 
    WHERE shg_id = shg_uuid 
      AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_shg_leader(shg_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members 
    WHERE shg_id = shg_uuid 
      AND profile_id = auth.uid() 
      AND is_leader = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop old recursive policies
DROP POLICY IF EXISTS "Members can view their SHGs" ON public.shgs;
DROP POLICY IF EXISTS "Members can view their SHG members" ON public.members;
DROP POLICY IF EXISTS "Members can view their SHG savings" ON public.savings_accounts;
DROP POLICY IF EXISTS "Members can view their SHG loans" ON public.loans;

-- 3. Re-create robust policies for SHGs
CREATE POLICY "SHG Select Policy" ON public.shgs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "SHG Insert Policy" ON public.shgs
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "SHG Update Policy" ON public.shgs
    FOR UPDATE USING (public.is_shg_leader(id));

-- 4. Re-create robust policies for Members
CREATE POLICY "Members Select Policy" ON public.members
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members Insert Policy" ON public.members
    FOR INSERT WITH CHECK (profile_id = auth.uid() OR public.is_shg_leader(shg_id));

CREATE POLICY "Members Update Policy" ON public.members
    FOR UPDATE USING (public.is_shg_leader(shg_id));


-- 5. Re-create robust policies for Savings Accounts
CREATE POLICY "Savings Accounts Select Policy" ON public.savings_accounts
    FOR SELECT USING (public.is_shg_member(shg_id));

CREATE POLICY "Savings Accounts Insert Policy" ON public.savings_accounts
    FOR INSERT WITH CHECK (public.is_shg_leader(shg_id));

CREATE POLICY "Savings Accounts Update Policy" ON public.savings_accounts
    FOR UPDATE USING (public.is_shg_leader(shg_id));

-- 6. Re-create robust policies for Loans
CREATE POLICY "Loans Select Policy" ON public.loans
    FOR SELECT USING (public.is_shg_member(shg_id));

CREATE POLICY "Loans Insert Policy" ON public.loans
    FOR INSERT WITH CHECK (profile_id = auth.uid() OR public.is_shg_leader(shg_id));

CREATE POLICY "Loans Update Policy" ON public.loans
    FOR UPDATE USING (public.is_shg_leader(shg_id));

-- 7. Add policies for the new schema tables
-- Meetings
DROP POLICY IF EXISTS "Meetings Select Policy" ON public.meetings;
DROP POLICY IF EXISTS "Meetings Insert Policy" ON public.meetings;
CREATE POLICY "Meetings Select Policy" ON public.meetings
    FOR SELECT USING (public.is_shg_member(shg_id));
CREATE POLICY "Meetings Insert Policy" ON public.meetings
    FOR INSERT WITH CHECK (public.is_shg_leader(shg_id));

-- Meeting Attendance
DROP POLICY IF EXISTS "Attendance Select Policy" ON public.meeting_attendance;
DROP POLICY IF EXISTS "Attendance Write Policy" ON public.meeting_attendance;
CREATE POLICY "Attendance Select Policy" ON public.meeting_attendance
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.meetings WHERE id = meeting_attendance.meeting_id AND public.is_shg_member(meetings.shg_id)
    ));
CREATE POLICY "Attendance Write Policy" ON public.meeting_attendance
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.meetings WHERE id = meeting_attendance.meeting_id AND public.is_shg_leader(meetings.shg_id)
    ));

-- Loan Repayments
DROP POLICY IF EXISTS "Repayments Select Policy" ON public.loan_repayments;
DROP POLICY IF EXISTS "Repayments Write Policy" ON public.loan_repayments;
CREATE POLICY "Repayments Select Policy" ON public.loan_repayments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.loans WHERE id = loan_repayments.loan_id AND public.is_shg_member(loans.shg_id)
    ));
CREATE POLICY "Repayments Write Policy" ON public.loan_repayments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.loans WHERE id = loan_repayments.loan_id AND public.is_shg_leader(loans.shg_id)
    ));

-- Skill Enrollments
DROP POLICY IF EXISTS "Enrollments Select Policy" ON public.skill_enrollments;
DROP POLICY IF EXISTS "Enrollments Insert Policy" ON public.skill_enrollments;
CREATE POLICY "Enrollments Select Policy" ON public.skill_enrollments
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enrollments Insert Policy" ON public.skill_enrollments
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.members WHERE id = skill_enrollments.member_id AND profile_id = auth.uid()
    ));

-- Grant Applications
DROP POLICY IF EXISTS "Grant Applications Select Policy" ON public.grant_applications;
DROP POLICY IF EXISTS "Grant Applications Insert Policy" ON public.grant_applications;
CREATE POLICY "Grant Applications Select Policy" ON public.grant_applications
    FOR SELECT USING (public.is_shg_member(shg_id));
CREATE POLICY "Grant Applications Insert Policy" ON public.grant_applications
    FOR INSERT WITH CHECK (public.is_shg_leader(shg_id));

-- Marketplace Products
DROP POLICY IF EXISTS "Marketplace Select Policy" ON public.marketplace_products;
DROP POLICY IF EXISTS "Marketplace Write Policy" ON public.marketplace_products;
CREATE POLICY "Marketplace Select Policy" ON public.marketplace_products
    FOR SELECT USING (true);
CREATE POLICY "Marketplace Write Policy" ON public.marketplace_products
    FOR ALL USING (public.is_shg_member(shg_id));
