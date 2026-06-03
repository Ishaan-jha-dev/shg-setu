-- ============================================================
-- Migration: Grant Discovery Engine
-- Description: Enhances the grant_schemes table with highly structured
--              fields for deterministic matching and document tracking,
--              and seeds it with high-value Central & UP State schemes.
-- ============================================================

-- 1. Enhance the grant_schemes table
ALTER TABLE public.grant_schemes
ADD COLUMN state VARCHAR(100) DEFAULT 'All India',
ADD COLUMN required_documents TEXT[] DEFAULT '{}',
ADD COLUMN application_process TEXT,
ADD COLUMN target_beneficiary VARCHAR(200),
ADD COLUMN last_updated DATE DEFAULT CURRENT_DATE;

-- 2. Clean out old un-structured data (if any)
DELETE FROM public.grant_schemes;

-- 3. Seed with high-value structured schemes

-- DAY-NRLM
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'DAY-NRLM Community Investment Fund (CIF)', 'BUSINESS',
    'Revolving fund support for SHGs via federations for micro-credit, income generation, and livelihood activities.',
    'SHG must be active for 6+ months, graded, and following Panchasutra (regular meetings, savings, internal lending, recoveries, bookkeeping).',
    300000, 'Ministry of Rural Development', 'All India',
    ARRAY['SHG Resolution Copy', 'SHG Grading Report', 'Bank Passbook Copy', 'Members KYC', 'Micro-Credit Plan (MCP)'],
    '1. Prepare Micro-Credit Plan at SHG level.\n2. Submit to Village Organization (VO).\n3. VO reviews and submits to Cluster Level Federation (CLF).\n4. Funds transferred from CLF to VO to SHG account.',
    'Women SHGs graded A/B'
);

-- NABARD Dairy Support
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'NABARD Dairy Entrepreneurship Development Scheme', 'AGRICULTURE',
    'Back-ended capital subsidy to set up modern dairy farms and promote heifer calf rearing.',
    'Farmers, individual entrepreneurs, NGOs, companies, groups of unorganised and organised sector. Applicable for 2 to 10 milch animals.',
    700000, 'NABARD', 'All India',
    ARRAY['Detailed Project Report (DPR)', 'Land Records (if applicable)', 'Bank Loan Approval Letter', 'Aadhaar Card', 'Caste Certificate (for higher subsidy)'],
    '1. Prepare DPR for dairy unit.\n2. Apply for bank loan.\n3. Bank sanctions loan and applies to NABARD for subsidy.\n4. Subsidy kept in Subsidy Reserve Fund Account.',
    'Dairy Farmers, SHGs, Rural Entrepreneurs'
);

-- ATMA Training
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'ATMA Skill & Training Grant', 'AGRICULTURE',
    'Capacity building and training support for farmers and SHGs in modern agricultural practices.',
    'Farmers, Farmer Interest Groups (FIGs), Women Food Security Groups (FSGs).',
    25000, 'Agricultural Technology Management Agency', 'All India',
    ARRAY['SHG/Group Registration', 'List of Members', 'Proposed Training Plan', 'Bank Details'],
    '1. Submit training requirement to Block Technology Manager (BTM).\n2. ATMA Management Committee approves.\n3. Funds released or training directly organized.',
    'Farmer Groups, Rural Women'
);

-- UP ODOP
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'UP ODOP Margin Money Subsidy Scheme', 'BUSINESS',
    'Financial assistance for manufacturing/service sector enterprises relating to the identified ODOP product of the district.',
    'Age 18+, UP Resident. Project related to district''s ODOP product.',
    2000000, 'Govt of Uttar Pradesh', 'Uttar Pradesh',
    ARRAY['Detailed Project Report', 'UP Domicile Certificate', 'Aadhaar Card', 'Educational Certificate', 'Land/Shed Details'],
    '1. Apply online on ODOP portal.\n2. District Level Task Force Committee screens application.\n3. Forwarded to Bank for loan sanction.\n4. Margin money transferred to bank.',
    'Micro Entrepreneurs, Artisans, SHGs in UP'
);

-- UPSRLM
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'UPSRLM Start-up Village Entrepreneurship Programme (SVEP)', 'BUSINESS',
    'Supports SHG members to set up enterprises at the village level in non-agricultural sectors.',
    'Must be an SHG member under UPSRLM.',
    100000, 'UP State Rural Livelihood Mission', 'Uttar Pradesh',
    ARRAY['SHG Membership Proof', 'Business Plan (approved by CRP-EP)', 'Aadhaar Card', 'Bank Passbook'],
    '1. Community Resource Person for Enterprise Promotion (CRP-EP) helps prepare business plan.\n2. Block Resource Centre (BRC) evaluates and approves.\n3. Loan/Grant sanctioned via Community Enterprise Fund.',
    'Women SHG Members in UP'
);

-- Stand-Up India
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'Stand-Up India Scheme', 'BUSINESS',
    'Facilitates bank loans between 10 lakh and 1 Crore to at least one SC/ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.',
    'SC/ST and/or woman entrepreneur, above 18 years of age. Greenfield project only.',
    10000000, 'Ministry of Finance / SIDBI', 'All India',
    ARRAY['Identity Proof (Aadhaar/PAN)', 'Caste Certificate (if SC/ST)', 'Project Report', 'Rent Agreement / Property Papers', 'Quotations for Machinery'],
    '1. Apply through Stand-Up India portal, through Lead District Manager (LDM), or directly at branch.\n2. Application reviewed by bank.\n3. Sanction and disbursement.',
    'Women Entrepreneurs, SC/ST'
);

-- Mahila Shakti Kendra
INSERT INTO public.grant_schemes (
    name, category, description, eligibility, max_amount, provider, 
    state, required_documents, application_process, target_beneficiary
) VALUES (
    'Mahila Shakti Kendra (MSK)', 'EDUCATION',
    'Empower rural women with opportunities for skill development, employment, digital literacy, health and nutrition.',
    'Rural women in selected districts.',
    0, 'Ministry of Women and Child Development', 'All India',
    ARRAY['Aadhaar Card', 'BPL Card (if applicable)', 'Proof of Residence'],
    '1. Approach Block/District Level Centre for Women.\n2. Register for specific training/awareness camp.',
    'Rural Women'
);
