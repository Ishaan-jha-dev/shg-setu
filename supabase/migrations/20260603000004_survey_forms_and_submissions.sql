-- ============================================================
-- Migration: Survey Forms & Dynamic Submissions (ODK / Kobo)
-- ============================================================

-- Table to store form templates
CREATE TABLE IF NOT EXISTS public.survey_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL, -- Array of field definitions: [{name: string, label: string, type: 'text'|'number'|'select'|'gps', required: boolean, options?: string[]}]
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store submitted survey data
CREATE TABLE IF NOT EXISTS public.survey_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.survey_forms(id) ON DELETE CASCADE,
    shg_id UUID REFERENCES public.shgs(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    answers JSONB NOT NULL, -- Key-value answers: {question_name: answer_value}
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.survey_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies (non-recursive and simple for MVP/Offline sync)
CREATE POLICY "Allow read survey_forms" ON public.survey_forms
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow write survey_forms" ON public.survey_forms
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow read survey_submissions" ON public.survey_submissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow insert survey_submissions" ON public.survey_submissions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insert a default "SHG Household Survey" form as an example
INSERT INTO public.survey_forms (title, description, fields) VALUES
(
    'SHG Household Baseline Survey',
    'Standard socioeconomic baseline survey for new SHG member households (Socioeconomic indicators, source of income, assets, etc.)',
    '[
        {"name": "respondent_name", "label": "Respondent Full Name", "type": "text", "required": true},
        {"name": "family_members_count", "label": "Number of Family Members", "type": "number", "required": true},
        {"name": "primary_income_source", "label": "Primary Source of Income", "type": "select", "required": true, "options": ["Agriculture", "Daily Wages", "Micro-Business", "Handicrafts", "Other"]},
        {"name": "monthly_income", "label": "Estimated Monthly Household Income (₹)", "type": "number", "required": true},
        {"name": "has_bank_account", "label": "Does the family have active bank accounts?", "type": "select", "required": true, "options": ["Yes, all members", "Yes, some members", "No"]},
        {"name": "gps_coordinates", "label": "Household Location GPS", "type": "gps", "required": false}
    ]'::jsonb
),
(
    'SHG Group Grading & Audit',
    'Monthly field audit for SHG meetings compliance, book-keeping quality, and savings regularity.',
    '[
        {"name": "meeting_regularity", "label": "Meeting Regularity Grade", "type": "select", "required": true, "options": ["Excellent (Weekly)", "Good (Monthly)", "Irregular", "No meetings conducted"]},
        {"name": "ledger_maintenance", "label": "Are books of accounts maintained up to date?", "type": "select", "required": true, "options": ["Yes, completely", "Partially updated", "No books maintained"]},
        {"name": "savings_regularity", "label": "Are savings collected from all members?", "type": "select", "required": true, "options": ["Yes, 100% attendance & collection", "Partial collection", "No savings collected"]},
        {"name": "audit_remarks", "label": "Auditor Remarks & Guidance", "type": "text", "required": false}
    ]'::jsonb
)
ON CONFLICT DO NOTHING;
