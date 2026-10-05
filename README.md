# Rajasthan RERA Forensic & Compliance Audit Intelligence System

[![RERA Compliance](https://img.shields.io/badge/Compliance-RERA%20Sec%204(2)(l)(D)-blue)](https://rera.rajasthan.gov.in)
[![Audit Status](https://img.shields.io/badge/Audit%20Status-Active-emerald)](#)
[![TypeScript](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb)](#)
[![Python](https://img.shields.io/badge/Pipeline-Python%20%7C%20pdfplumber%20%7C%20Selenium-yellow)](#)
[![Design](https://img.shields.io/badge/Design-Soft%20Claymorphic%20Light-coral)](#)

An enterprise-grade forensic and regulatory compliance audit platform built to systematically cross-verify public promoter self-declarations on the **Rajasthan Real Estate Regulatory Authority (RERA)** portal against legally certified evidence from registered Architects (**Form R-1**), Engineers (**Form R-2**), and Chartered Accountants (**Form R-3**).

---

## 🌐 Live Public Dashboard URL (Shareable With Anyone)

The interactive forensic audit intelligence dashboard is live on the web and can be viewed by anyone worldwide without installing anything:

- 🔗 **Public Web App**: **[https://samarth-chaudhary.github.io/Rera/](https://samarth-chaudhary.github.io/Rera/)**
- 📊 **Overview & Trajectory**: [https://samarth-chaudhary.github.io/Rera/?tab=overview](https://samarth-chaudhary.github.io/Rera/?tab=overview)
- 🏢 **Projects & Scheme Portfolios**: [https://samarth-chaudhary.github.io/Rera/?tab=projects](https://samarth-chaudhary.github.io/Rera/?tab=projects)
- ⚖️ **Quarterly Reconciliation Matrix**: [https://samarth-chaudhary.github.io/Rera/?tab=reconciliation](https://samarth-chaudhary.github.io/Rera/?tab=reconciliation)
- 🚩 **Red Flags & Regulatory Anomalies**: [https://samarth-chaudhary.github.io/Rera/?tab=red-flags](https://samarth-chaudhary.github.io/Rera/?tab=red-flags)
- 📑 **Evidence & Document Cloud**: [https://samarth-chaudhary.github.io/Rera/?tab=documents](https://samarth-chaudhary.github.io/Rera/?tab=documents)
- 🧪 **Automated Test Runner**: [https://samarth-chaudhary.github.io/Rera/?tab=tests](https://samarth-chaudhary.github.io/Rera/?tab=tests)

---

## 💻 Local Development URL

If running locally on your workstation via `npm run dev`:

- **Local Host URL**: [http://localhost:5173/](http://localhost:5173/)

---

## 📁 Repository Structure

```
RERA_DATA/
├── RERA_CODE/
│   ├── 01_rera_portal_scraper_and_downloader.ipynb    # Automated portal scraper, QPR filing iterator & certificate downloader
│   └── 02_rera_forensic_comparison_engine.ipynb       # PDF extraction engine (pdfplumber), variance calculator & discrepancy classifier
│
├── dashboard/                                         # Modern Claymorphic React + TypeScript Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── OverviewView.tsx                   # 5 KPI cards with donut micro-rings, dual-spline chart, gauge & pill bars
│   │   │   │   ├── ProjectView.tsx                    # Scheme portfolio deep-dive, sales velocity & quarterly archive folders
│   │   │   │   ├── ReconciliationView.tsx             # Form R-1, R-2, R-3 comparison progress bars & detailed ledgers
│   │   │   │   ├── RedFlagsView.tsx                   # Prioritized anomaly table with sorting, filters & CSV export
│   │   │   │   ├── DocumentsView.tsx                  # Cloud document repository with status indicators
│   │   │   │   └── TestSuiteView.tsx                  # Automated test runner verifying Section 47 & 48 assertions
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx                         # Claymorphic greeting, pill dropdowns, search & CTA button
│   │   │   │   └── Sidebar.tsx                        # Floating white dock with active squircle & status badges
│   │   │   ├── modals/                                # Evidence drawer, export modal, audit methodology modal
│   │   │   └── ui/                                    # Status badges, indicators & cards
│   │   ├── data/
│   │   │   └── normalized_rera_database.json          # Normalized multi-quarter forensic audit database
│   │   └── lib/                                       # Currency formatting, test runner, calculations
│   └── package.json
│
├── scripts/
│   └── normalize_rera_data.py                         # Production ingestion script converting raw folders to normalized JSON
│
├── DREAM COLONY/                                      # Audited quarterly filings for Dream Colony (Ajmer)
├── RIDHI SIDHI COMMERCIAL HUB BLOCK A/                # Audited quarterly filings for Ridhi Sidhi (Sri Ganganagar)
├── SHIV ENCLAVE/                                      # Audited quarterly filings for Shiv Enclave (JDA Jaipur)
├── .gitignore
└── README.md
```

---

## 🔍 Core Forensic Discoveries

### 1. Shiv Enclave (JDA Jaipur) — ₹104.55 Crore Statutory Breach
- **Filing**: Quarter April to June, 2024 (Form R-3 Table 2, Row 1)
- **Portal Stated**: ₹1,06,57,15,460.00 (~₹106.57 Crore)
- **CA Certified Legal Limit**: ₹2,02,03,960.00 (~₹2.02 Crore)
- **Absolute Variance**: **₹1,04,55,11,500.00 (~₹104.55 Crore over-statement)**
- **Forensic Diagnosis**: The developer inadvertently entered the project's cumulative land cost into the eligible withdrawal cell on the public portal, resulting in a **52.7x overstatement** of permissible escrow withdrawals under RERA Section 4(2)(l)(D).

### 2. Dream Colony (Ajmer) — Multi-Quarter Sales Stagnation
- **Duration**: 6 consecutive quarters (Q2 2024 through Q4 2025)
- **Status**: Unit sales flatlined at exactly 33 plots sold out of 41 total plots.
- **Exposure**: 5 plots continuously mortgaged to the bank with 3 unsold units remaining unliquidated.

### 3. Ridhi Sidhi Commercial Hub (Sri Ganganagar) — High-Concordance Baseline
- **Performance**: 0 critical discrepancies and 0 warnings across all cataloged quarters, serving as the system's clean control baseline.

---

## ⚖️ Statutory Audit Methodology & Formulas

The system implements the audit standards codified under the **Real Estate (Regulation and Development) Act, 2016**:

### Variance Calculations
- **Currency Fields (₹)**:
  $$\text{Absolute Variance} = |\text{Web Stated Value} - \text{Certified Legal Value}|$$
  $$\text{Relative Variance} = \frac{|\text{Web Stated Value} - \text{Certified Legal Value}|}{\text{Certified Legal Value}} \times 100\%$$
- **Percentage Fields (%)**:
  $$\text{Variance (pp)} = |\text{Web Stated Percentage} - \text{Certified Legal Percentage}|$$

### Severity Classification Rules
| Severity Badge | Criterion | Action Required |
| :--- | :--- | :--- |
| <span style="color:#e11d48;font-weight:bold;">🔴 CRITICAL</span> | Variance $> ₹10,00,000$ OR $> 30$ percentage points | Immediate regulatory inspection & escrow freeze notice |
| <span style="color:#b45309;font-weight:bold;">🟡 WARNING</span> | Discrepancy detected below critical thresholds | Developer explanation notice & 15-day rectification window |
| <span style="color:#1d4ed8;font-weight:bold;">🟣 DATA GAP</span> | Mandatory statutory certificate unuploaded or corrupt URL | Section 11 statutory non-compliance notice |
| <span style="color:#047857;font-weight:bold;">🟢 MATCH</span> | Difference $\le ₹1.00$ or $\le 0.1\text{ pp}$ | Regulatory concordance verified |

---

## 🛠️ Quick Start & Execution

### 1. Launching the Audit Dashboard
```bash
# Navigate to the dashboard directory
cd dashboard

# Install dependencies
npm install

# Start the development server
npm run dev

# Open your browser at http://localhost:5173/
```

### 2. Running Automated Audit Tests
The dashboard includes an automated compliance test suite verifying Indian numbering formats, percentage point calculations, zero/null values, and project ground truths:
```bash
# Run production build and typechecks
npm run build
```
Or open the **Audit Tests** tab in the dashboard at `http://localhost:5173/?tab=tests`.

### 3. Running the Scraper & Comparison Pipelines
```bash
# Prerequisites
pip install selenium pandas pdfplumber requests openpyxl jupyter

# Open Jupyter Notebooks
cd RERA_CODE
jupyter notebook
```
- Run `01_rera_portal_scraper_and_downloader.ipynb` to crawl and download quarterly certificates.
- Run `02_rera_forensic_comparison_engine.ipynb` to execute PDF text extraction and generate variance matrices.

---

## 🎨 UI/UX Design System

The platform features a **Soft Claymorphic Light Theme** inspired by modern fintech command centers:
- **Soft Ambient Background**: Smooth warm pastel gradient (`#F8F9FD` with soft coral, peach, and lavender glows).
- **Claymorphic Floating Cards**: Pure white surfaces with multi-layered diffuse drop shadows (`shadow-clay`).
- **Radial Donut Micro-Rings**: SVG circular progress arcs with directional trend arrows (`↗` / `↙`).
- **Vibrant Accent Controls**: Coral gradient CTA buttons (`#FF6B35` to `#F97316`) and royal blue active tabs (`#3B5BFD`).
- **Interactive Visualizations**: Dual-spline trajectory curves with 2014 active pin tooltip, 74% semi-circular gauge arc, and grouped rounded pill bar charts.

---

## 📄 License & Attribution
Developed for forensic compliance research and regulatory transparency under the Rajasthan Real Estate Regulatory Authority framework.
