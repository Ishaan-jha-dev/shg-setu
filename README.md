# Setu SHG Platform (Saath • Vikas • Samriddhi)

An all-in-one digital ecosystem built to empower Self-Help Groups (SHGs) across rural India. Setu bridges the gap between SHG members, SHG Leaders, and Government/NGO authorities by providing comprehensive tools for skill development, grant acquisition, financial management, and global expansion.

---

## 📱 Mobile Application

We understand that mobile phones are the primary way rural women access the internet. A dedicated **Flutter (Dart) Mobile Application** has been developed to ensure the Setu platform is accessible at the grassroots level.

👉 **[DOWNLOAD THE MOBILE APP HERE](https://github.com/Ishaan-jha-dev/shg-setu/tree/main/apps/mobile)** 👈

**Key Mobile Features:**
- **Multilingual Support:** Select from 12 Indian languages right from the login screen.
- **Role-Based Experience:** Custom dashboards for Members and Leaders.
- **Offline-First Capabilities:** Works seamlessly in low-connectivity areas (coming soon).
- **Core Functionality:** Access savings ledgers, enrolled skill programs, and discover government grants directly from your phone.

---

## 🏗️ Platform Flow & Architecture

Setu operates on a highly structured, role-based architecture designed for transparency, impact, and ease of use.

### 1. User Onboarding (Role-Based Access)
- **SHG Member:** Simple registration requiring basic details. Dashboard focuses on individual tracking (Savings, "My Skills", "My Grants").
- **SHG Leader:** Detailed KYC and group registration. Dashboard focuses on group management (Scheduling meetings, approving internal loans, applying for group grants).
- **Authorities (NGOs/Govt):** Registration requiring official credentials. Dashboard focuses on monitoring grassroots impact, verifying SHG data, and disbursing scheme funds.

### 2. Skill Development Hub (Learn, Grow, Earn)
- **Discovery:** Browse a catalog of skill programs (Vocational, Digital, Agriculture) curated by partners like NSDC, NABARD, and KVIC.
- **Enrollment:** Members can enroll in programs; Leaders can bulk-enroll their groups.
- **Completion & Certification:** Upon completing the training, digital certificates are generated and securely stored in the member's profile.

### 3. Grant Discovery Engine
- **Database:** A comprehensive database of Central and State government schemes (e.g., NRLM, MSME, UP State schemes).
- **Matching:** Smart algorithms filter schemes based on the SHG's profile and eligibility criteria.
- **Application Flow:** Seamless transition from discovering a grant to submitting the required documentation.

### 4. Financial & Meeting Management (Core Model)
- **Digital Bahi-Khata:** Digitizes the traditional physical ledger.
- **Savings:** Automatically tracks monthly contributions from each member.
- **Internal Loans:** Leaders can disburse internal loans to members with transparent, system-calculated repayment schedules.
- **Meetings:** Schedule and record minutes of monthly group meetings.

### 5. Global Market Linkage (Future Phase)
- **Showcase:** SHGs can list authentic, handcrafted, and agricultural products.
- **B2B/B2C Connection:** Connects rural artisans directly to national and global buyers, eliminating the middleman.

---

## 🛠️ Technology Stack

* **Frontend (Web):** Next.js (React), TailwindCSS, TypeScript.
* **Frontend (Mobile):** Flutter (Dart).
* **Backend & Database:** Supabase (PostgreSQL, Auth, Storage).
* **Design:** Clean, earthy aesthetics (Greens, Oranges, Cream) ensuring a premium, trustworthy look.

---

## 🚀 Getting Started Locally

### Web Application
1. Navigate to the consumer app: `cd apps/consumer`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the web platform at `http://localhost:3000`

### Mobile Application
1. Navigate to the mobile app: `cd apps/mobile`
2. Ensure Flutter is installed and Developer Mode is enabled on Windows.
3. Install dependencies: `flutter pub get`
4. Run the app: `flutter run`

---
*Empowering women, one group at a time.*
