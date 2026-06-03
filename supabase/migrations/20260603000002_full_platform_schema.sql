-- ============================================================
-- Migration: Full SHG Platform Schema
-- Inspired by: Mifos X + Apache Fineract architecture
-- ============================================================

-- Loan Products Catalog (Fineract: LoanProduct)
CREATE TABLE IF NOT EXISTS public.loan_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_principal NUMERIC(15, 2) DEFAULT 500,
    max_principal NUMERIC(15, 2) DEFAULT 100000,
    interest_rate_per_period NUMERIC(5, 2) DEFAULT 2.0, -- % per month
    repayment_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    min_repayment_periods INTEGER DEFAULT 1,
    max_repayment_periods INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default loan products
INSERT INTO public.loan_products (name, description, min_principal, max_principal, interest_rate_per_period, min_repayment_periods, max_repayment_periods) VALUES
('Emergency Loan', 'Short-term emergency relief loan for urgent needs', 500, 10000, 1.0, 1, 3),
('Business Loan', 'Loan to start or expand a small business', 5000, 50000, 2.0, 3, 24),
('Agriculture Loan', 'For seeds, tools, and farming inputs', 2000, 30000, 1.5, 3, 12),
('Education Loan', 'For school fees, books, and training costs', 1000, 20000, 1.0, 3, 12),
('Housing Loan', 'For home repair and improvement', 10000, 100000, 1.5, 12, 60)
ON CONFLICT DO NOTHING;

-- Loans table (enhanced from base migration)
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
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loan Repayments (Fineract: LoanTransaction)
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
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PARTIAL, PAID, OVERDUE
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings (Mifos X: Meeting)
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    meeting_type VARCHAR(30) DEFAULT 'REGULAR', -- REGULAR, SPECIAL
    agenda TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    conducted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Attendance
CREATE TABLE IF NOT EXISTS public.meeting_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (meeting_id, member_id)
);

-- Skills Programs
CREATE TABLE IF NOT EXISTS public.skill_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- VOCATIONAL, DIGITAL, AGRICULTURE, FINANCE, HEALTH
    description TEXT,
    duration_weeks INTEGER DEFAULT 4,
    provider VARCHAR(200),
    is_free BOOLEAN DEFAULT TRUE,
    fee NUMERIC(10, 2) DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Enrollments
CREATE TABLE IF NOT EXISTS public.skill_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES public.skill_programs(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ENROLLED', -- ENROLLED, IN_PROGRESS, COMPLETED, DROPPED
    UNIQUE (program_id, member_id)
);

-- Insert default skill programs
INSERT INTO public.skill_programs (name, category, description, duration_weeks, provider, is_free) VALUES
('Basic Tailoring & Stitching', 'VOCATIONAL', 'Learn basic to advanced sewing and garment making for home-based business', 8, 'KVIC / State Skill Mission', TRUE),
('Organic Farming & Composting', 'AGRICULTURE', 'Modern organic farming techniques, soil health, and composting methods', 6, 'KVK / NABARD', TRUE),
('Basic Mobile Banking & UPI', 'DIGITAL', 'Learn to use UPI, BHIM app, and mobile banking safely', 2, 'Setu SHG / NABARD', TRUE),
('Pickle & Papad Making', 'VOCATIONAL', 'Food processing for home-based micro-enterprise and SHG collective', 4, 'FSSAI / State Dept', TRUE),
('Mushroom Cultivation', 'AGRICULTURE', 'Low-cost mushroom farming as a supplementary income source', 3, 'State Agriculture Dept', TRUE),
('Digital Literacy Basics', 'DIGITAL', 'Smartphone usage, internet safety, and government portal navigation', 4, 'CSC / Setu SHG', TRUE),
('Basic Accounts & Bookkeeping', 'FINANCE', 'Learn to maintain SHG passbooks, ledger entries, and financial records', 3, 'NABARD / SRLM', TRUE),
('Goat & Poultry Rearing', 'AGRICULTURE', 'Animal husbandry basics for income generation from livestock', 4, 'Animal Husbandry Dept', TRUE)
ON CONFLICT DO NOTHING;

-- Government Grants & Schemes
CREATE TABLE IF NOT EXISTS public.grant_schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    category VARCHAR(100), -- BUSINESS, AGRICULTURE, HOUSING, EDUCATION, HEALTH
    description TEXT,
    eligibility TEXT,
    max_amount NUMERIC(15, 2),
    provider VARCHAR(200),
    application_url TEXT,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant Applications
CREATE TABLE IF NOT EXISTS public.grant_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheme_id UUID REFERENCES public.grant_schemes(id) ON DELETE CASCADE,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
    applied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'APPLIED', -- APPLIED, UNDER_REVIEW, APPROVED, REJECTED
    notes TEXT,
    amount_approved NUMERIC(15, 2)
);

-- Insert default schemes
INSERT INTO public.grant_schemes (name, category, description, eligibility, max_amount, provider) VALUES
('NRLM / DAY-NRLM Community Investment Fund', 'BUSINESS', 'Revolving fund support for SHG federations and members for income-generating activities', 'Active SHG with 6+ months of regular savings and meetings', 300000, 'Ministry of Rural Development'),
('PM Vishwakarma Yojana', 'BUSINESS', 'Credit support and skill training for artisans and craftspeople from traditional occupations', 'Artisans, craftspeople in 18 traditional trades', 200000, 'Ministry of MSME'),
('PMMY - Mudra Loan (Shishu)', 'BUSINESS', 'Micro-enterprise loans for non-farm income activities up to ₹50,000', 'Non-farm micro/small enterprise, no collateral needed', 50000, 'MUDRA / Banks'),
('PMMY - Mudra Loan (Kishore)', 'BUSINESS', 'Business expansion loans from ₹50,000 to ₹5 lakhs for established enterprises', 'Existing micro-enterprise needing expansion funds', 500000, 'MUDRA / Banks'),
('PM Fasal Bima Yojana', 'AGRICULTURE', 'Crop insurance scheme protecting farmers against yield losses from natural calamities', 'All farmers with Kisan Credit Card or land records', NULL, 'Ministry of Agriculture'),
('NABARD SHG Credit Linkage', 'BUSINESS', 'Bank credit linkage for mature SHGs for livelihood activities and enterprise development', 'SHG graded Grade A/B with 2+ years of existence', 500000, 'NABARD'),
('PM Awas Yojana - Gramin', 'HOUSING', 'Housing assistance for Below Poverty Line families in rural areas', 'BPL families without pucca house, rural areas', 120000, 'Ministry of Rural Development'),
('Sukanya Samriddhi Yojana', 'EDUCATION', 'High-interest savings scheme for girl child education and marriage expenses', 'Girl child below 10 years of age, one account per family', 150000, 'Ministry of Finance')
ON CONFLICT DO NOTHING;

-- Marketplace Products (Global Expansion)
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
    is_listed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Public read access on catalog tables
CREATE POLICY "Public read loan_products" ON public.loan_products FOR SELECT USING (true);
CREATE POLICY "Public read skill_programs" ON public.skill_programs FOR SELECT USING (true);
CREATE POLICY "Public read grant_schemes" ON public.grant_schemes FOR SELECT USING (true);
