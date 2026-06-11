/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              DOORLOOP TRAINING DATA                         ║
 * ║                                                             ║
 * ║  This file powers both the Training Hub and Help Widget.    ║
 * ║  Edit it to add videos, update links, or manage sections.   ║
 * ║                                                             ║
 * ║  📖  See data/README.md for step-by-step instructions.      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  QUICK RULES:
 *  ─────────────
 *  1. Every string must be in "double quotes"
 *  2. Every item needs a comma after it EXCEPT the last one
 *  3. Use null (no quotes) when a field doesn't apply
 *  4. After editing → open browser → press F12 → check for red errors
 *
 *
 *  TABLE OF CONTENTS:            (Ctrl+F to jump)
 *  ──────────────────
 *  [CONFIG]          → Global settings (don't touch)
 *  [DASHBOARD]       → Welcome & setup videos
 *  [PROPERTIES]      → Properties & units
 *  [TENANTS]         → Tenant management
 *  [LEASES]          → Lease management
 *  [ACCOUNTING]      → Chart of accounts, expenses, reports
 *  [PAYMENTS]        → Online & manual payments
 *  [MAINTENANCE]     → Requests, work orders, vendors
 *  [COMMUNICATIONS]  → Email, SMS, listings
 *  [REPORTS]         → Financial reports & custom builder
 *  [AI]              → AI assistant features
 *  [WORKFLOWS]       → Automation workflows
 *  [COMPANY SETTINGS] → Company-wide settings & preferences
 *  [LEAD TO LEASE]   → Listings, applications, e-signatures
 *  [PAGE ALIASES]    → URL-to-section mapping (for Help Widget)
 *  [TRAINING HUB]    → Hub page module groupings
 *
 *
 *  VIDEO FIELDS REFERENCE:
 *  ───────────────────────
 *    id       → Unique ID. Format: "v-{section}-{number}"  (e.g. "v-dash-4")
 *    title    → Video title shown to the user
 *    desc     → One-sentence description
 *    wistiaId → The hash from your Wistia video URL
 *    duration → Video length as "M:SS"
 *    helpUrl  → Full URL to the matching help center article
 *    tourId   → Intercom product tour ID, or null if no tour
 *    appPath  → In-app path the tour starts on, or null if no tour
 *    isNew    → (optional) true = show a NEW badge. Omit or false = no badge.
 */

window.DOORLOOP_TRAINING_DATA = {


/* ┌──────────────────────────────────────────────────────────────┐
 * │  [CONFIG]  Global settings — rarely changed                  │
 * └──────────────────────────────────────────────────────────────┘ */

  "config": {
    "helpCenterUrl": "https://support.doorloop.com/en/",
    "academyUrl":    "https://sandbox-training-academy.bbolio.apps.deploybay.doorloop.com",
    "whatsNewUrl":   "https://support.doorloop.com/en/collections/3851236-doorloop-updates",
    "scheduleUrl":   "https://calendly.com/doorloop-training",
    "storageKey":    "doorloop_training_progress"   // ⚠️ Changing this resets everyone's progress!
  },


/* ┌──────────────────────────────────────────────────────────────┐
 * │  SECTIONS  — One per feature area                            │
 * │                                                              │
 * │  Each section has: label, icon, and videos.                  │
 * │  Don't rename section keys (e.g. "dashboard") unless you     │
 * │  also update [PAGE ALIASES] and [TRAINING HUB] below.        │
 * └──────────────────────────────────────────────────────────────┘ */

  "sections": {


    /* ─────────────────────────────────────────────────────────
     *  [DASHBOARD]  Welcome & setup videos
     * ───────────────────────────────────────────────────────── */
    "dashboard": {
      "label": "Dashboard",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/></svg>",
      "videos": [

        {
          "id":       "v-dash-1",
          "title":    "Welcome to DoorLoop",
          "desc":     "Quick platform overview — the dashboard, navigation, and additional resources we have available for you.",
          "wistiaId": "6dqwhwx8xg",
          "duration": "4:34",
          "helpUrl":  "https://support.doorloop.com/en/articles/6974026-learn-how-to-navigate-doorloop",
          "tourId":   "663426",
          "appPath":  "/home"
        },

        {
          "id":       "v-dash-2",
          "title":    "Navigating the Dashboard",
          "desc":     "Understand your widgets and how to customise the view.",
          "wistiaId": "q3oejrw55n",
          "duration": "1:15",
          "helpUrl":  "https://support.doorloop.com/en/collections/3383226-set-up-your-dashboard-and-widgets",
          "tourId":   "663441",
          "appPath":  "/home"
        },

        {
          "id":       "v-dash-3",
          "title":    "Company Information & Branding",
          "desc":     "Configure your company name, details, and personalize your information.",
          "wistiaId": "jaj6nhcolu",
          "duration": "2:19",
          "helpUrl":  "https://support.doorloop.com/en/articles/7273747-update-your-company-information",
          "tourId":   "663453",
          "appPath":  "/settings/general-settings"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [COMPANY SETTINGS]  Company-wide settings & preferences
     * ───────────────────────────────────────────────────────── */
    "company-settings": {
      "label": "Company Settings",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z\"/></svg>",
      "videos": [

        {
          "id":       "v-cs-0a",
          "title":    "Add New Users",
          "desc":     "Learn how to add new users to your DoorLoop account.",
          "wistiaId": "x5yvrlc6nz",
          "duration": "2:46",
          "helpUrl":  "https://support.doorloop.com/en/articles/6106066-add-a-user-to-your-doorloop-account",
          "tourId":   null,
          "appPath":  "/settings"
        },

        {
          "id":       "v-cs-0b",
          "title":    "Set User Roles & Permissions",
          "desc":     "Learn how to set user roles and permissions in your DoorLoop account.",
          "wistiaId": "pvk9lx92zm",
          "duration": "4:10",
          "helpUrl":  "https://support.doorloop.com/en/articles/6380630-limit-access-to-your-users-by-editing-user-roles",
          "tourId":   null,
          "appPath":  "/settings"
        },

        {
          "id":       "v-cs-1",
          "title":    "Tenant Portal Settings",
          "desc":     "Configure your tenant portal settings and preferences.",
          "wistiaId": "t65qdhawyi",
          "duration": "5:44",
          "helpUrl":  "https://support.doorloop.com/en/articles/6081899-customize-company-default-tenant-portal-settings",
          "tourId":   null,
          "appPath":  "/settings"
        },

       {
          "id":       "v-cs-2",
          "title":    "Rent & Payment Notifications",
          "desc":     "Set up notifications for rent and payment reminders.",
          "wistiaId": "efrz0afqha",
          "duration": "3:21",
          "helpUrl":  "https://support.doorloop.com/en/articles/6075986-set-up-rent-payment-notifications",
          "tourId":   null,
          "appPath":  "/settings"
        },

      {
          "id":       "v-cs-3",
          "title":    "Fees Settings Overview",
          "desc":     "Overview of your company's fee settings.",
          "wistiaId": "osq4pkssqe",
          "duration": "3:12",
          "helpUrl":  "https://support.doorloop.com/en/articles/14090354-fee-settings-overview",
          "tourId":   null,
          "appPath":  "/settings"
        },

        {
          "id":       "v-cs-4",
          "title":    "Late Fee Settings Deep Dive",
          "desc":     "Dive deep into your company's late fee settings and applying them in bulk.",
          "wistiaId": "sjhnowtsd7",
          "duration": "6:54",
          "helpUrl":  "https://support.doorloop.com/en/articles/6191191-set-up-your-late-fees-policy",
          "tourId":   null,
          "appPath":  "/settings"
        },

        {
          "id":       "v-cs-5",
          "title":    "Management Fees Setup and Configuration",
          "desc":     "Configure your management fee settings and apply them to your properties.",
          "wistiaId": "wpexhi610z",
          "duration": "7:50",
          "helpUrl":  "https://support.doorloop.com/en/articles/6156495-set-up-your-management-fees-policy",
          "tourId":   null,
          "appPath":  "/settings"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [PROPERTIES]  Properties & units
     * ───────────────────────────────────────────────────────── */
    "properties": {
      "label": "Properties & Units",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg>",
      "videos": [

        {
          "id":       "v-prop-1",
          "title":    "Add A New Property",
          "desc":     "Walk through adding a residential or commercial property.",
          "wistiaId": "pmogitfoao",
          "duration": "2:40",
          "helpUrl":  "https://support.doorloop.com/en/articles/6085796-add-a-new-property",
          "tourId":   null,
          "appPath":  "/rentals",
          "isNew":    false
        },

        {
          "id":       "v-prop-2",
          "title":    "Add A New Unit",
          "desc":     "Set up individual units.",
          "wistiaId": "qhbipfxe62",
          "duration": "1:20",
          "helpUrl":  "https://support.doorloop.com/en/articles/8470178-add-a-new-unit",
          "tourId":   "663489",
          "appPath":  "/home"
        },

        {
          "id":       "v-prop-3",
          "title":    "Import Your Existing Data",
          "desc":     "Bring in tenants, leases, and properties from your old system.",
          "wistiaId": "h9y7ymsrfc",
          "duration": "5:26",
          "helpUrl":  "https://support.doorloop.com/en/articles/8608503-import-your-data-into-doorloop",
          "tourId":   null,
          "appPath":  "/files"
        }

      ]
    },


 /* ─────────────────────────────────────────────────────────
     *  [LEASES]  Lease management
     * ───────────────────────────────────────────────────────── */
    "leases": {
      "label": "Leases",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"/><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"/></svg>",
      "videos": [

        {
          "id":       "v-lease-1",
          "title":    "Creating Leases",
          "desc":     "Set up lease agreements with terms and recurring charges.",
          "wistiaId": "3i8ub7vvpz",
          "duration": "4:28",
          "helpUrl":  "https://support.doorloop.com/en/articles/6115751-create-a-new-lease",
          "tourId":   null,
          "appPath":  "/leasing",
          "isNew":    false
        },

        {
          "id":       "v-lease-2",
          "title":    "Lease Renewals Overview",
          "desc":     "Handle renewals, rent increases, and move-outs.",
          "wistiaId": "34ofizmqi1",
          "duration": "3:49",
          "helpUrl":  "https://support.doorloop.com/en/articles/10207476-lease-renewals-overview",
          "tourId":   "663499",
          "appPath":  "/leases/renewals"
        },

        {
          "id":       "v-lease-3",
          "title":    "Lease Transactions Overview",
          "desc":     "Learn how to manage your tenants' lease ledgers.",
          "wistiaId": "80b0wtda2i",
          "duration": "3:40",
          "helpUrl":  "https://support.doorloop.com/en/articles/6076741-lease-transactions-overview",
          "tourId":   "663514",
          "appPath":  "/leases/active-leases"
        },

        {
          "id":       "v-lease-4",
          "title":    "Posting Charges",
          "desc":     "Learn how to post charges to your tenants' leases.",
          "wistiaId": "dkihcfrq10",
          "duration": "2:35",
          "helpUrl":  "https://support.doorloop.com/en/articles/6162147-post-a-one-time-charge-on-a-lease",
          "tourId":   "663517",
          "appPath":  "/leases/active-leases"
        },

        {
          "id":       "v-lease-5",
          "title":    "Recording Manual Payments",
          "desc":     "Learn how to record manual payments for your tenants.",
          "wistiaId": "dvz950y9qf",
          "duration": "3:28",
          "helpUrl":  "https://support.doorloop.com/en/articles/6162667-receive-a-payment-on-a-lease",
          "tourId":   "663519",
          "appPath":  "/leases/active-leases"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [TENANTS]  Tenant management
     * ───────────────────────────────────────────────────────── */
    "tenants": {
      "label": "Tenants",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75\"/></svg>",
      "videos": [

        {
          "id":       "v-ten-1",
          "title":    "Sending Tenant Portal Invites",
          "desc":     "Learn how to invite tenants to the portal.",
          "wistiaId": "9inwe6t7wj",
          "duration": "2:17",
          "helpUrl":  "https://support.doorloop.com/en/articles/6082689-invite-tenants-to-your-tenant-portal",
          "tourId":   "665518",
          "appPath":  "/tenants",
          "isNew":    false
        },

        {
          "id":       "v-ten-2",
          "title":    "Tenant Portal Overview",
          "desc":     "What tenants see when they log in — payments, requests, communications.",
          "wistiaId": "hkxwwfp62a",
          "duration": "3:19",
          "helpUrl":  "https://support.doorloop.com/en/articles/6254711-view-your-tenant-s-portal",
          "tourId":   "665521",
          "appPath":  "/tenants"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [LEAD TO LEASE]  Listings, applications, and e-signatures
     * ───────────────────────────────────────────────────────── */
    "lead-to-lease": {
      "label": "Lead to Lease",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"/><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"/></svg>",
      "videos": [
        {
          "id":       "v-ltl-1",
          "title":    "Listings",
          "desc":     "Learn how to create and publish rental listings directly from DoorLoop.",
          "wistiaId": "1xqjh8xe3d",
          "duration": "6:06",
          "helpUrl":  "https://support.doorloop.com/en/articles/6066925-create-an-online-listing-for-your-rentals",
          "tourId":   null,
          "appPath":  "/rentals"
        },
        {
          "id":       "v-ltl-2",
          "title":    "Rental Applications",
          "desc":     "Set up and manage online rental applications for prospective tenants.",
          "wistiaId": "cj0cls5dwu",
          "duration": "6:28",
          "helpUrl":  "https://support.doorloop.com/en/articles/6255188-company-default-rental-application-settings",
          "tourId":   null,
          "appPath":  "/people"
        },
        {
          "id":       "v-ltl-3",
          "title":    "eSignatures: Setting Up a Signature Template",
          "desc":     "Create reusable signature templates for leases and other documents.",
          "wistiaId": "n4hff6ccd5",
          "duration": "6:24",
          "helpUrl":  "https://support.doorloop.com/en/articles/11688977-create-an-electronic-signature-template",
          "tourId":   null,
          "appPath":  "/files"
        },
        {
          "id":       "v-ltl-4",
          "title":    "eSignatures: Sending Out a Signature Request",
          "desc":     "Send documents for e-signature directly through DoorLoop.",
          "wistiaId": "2hr70has8m",
          "duration": "6:29",
          "helpUrl":  "https://support.doorloop.com/en/articles/11689283-create-an-electronic-signature-request",
          "tourId":   null,
          "appPath":  "/files"
        }
      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [ACCOUNTING]  Chart of accounts, expenses, reports
     * ───────────────────────────────────────────────────────── */
    "accounting": {
      "label": "Accounting",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"23\"/><path d=\"M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6\"/></svg>",
      "videos": [

        {
          "id":       "v-acc-1",
          "title":    "Chart of Accounts Setup",
          "desc":     "Configure your chart of accounts for property management.",
          "wistiaId": "xjyi03n8fh",
          "duration": "3:46",
          "helpUrl":  "https://support.doorloop.com/en/articles/6170976-set-up-your-chart-of-accounts",
          "tourId":   "664513",
          "appPath":  "/accounts/chart-of-accounts"
        },

        {
          "id":       "v-acc-2",
          "title":    "Setting Your Opening Balances",
          "desc":     "Set your starting balances for your property bank accounts.",
          "wistiaId": "hj2t9t39eh",
          "duration": "10:45",
          "helpUrl":  "https://support.doorloop.com/en/articles/6206586-set-up-the-opening-balance-of-a-bank-account",
          "tourId":   null,
          "appPath":  "/accounting"
        },

        {
          "id":       "v-acc-3",
          "title":    "Import Transactions with Plaid",
          "desc":     "Automatically import your bank transactions into DoorLoop to streamline your accounting process.",
          "wistiaId": "6ilwrbhu60",
          "duration": "5:04",
          "helpUrl":  "https://support.doorloop.com/en/articles/9708276-import-transactions-with-plaid",
          "tourId":   null,
          "appPath":  "/accounting"
        },

        {
          "id":       "v-acc-4",
          "title":    "Bills & Expenses Overview",
          "desc":     "Get a comprehensive view of your bills and expenses.",
          "wistiaId": "mxjykke61a",
          "duration": "5:50",
          "helpUrl":  "https://support.doorloop.com/en/articles/7224727-the-difference-between-a-bill-and-an-expense",
          "tourId":   null,
          "appPath":  "/accounting"
        },

        {
          "id":       "v-acc-5",
          "title":    "Create and Pay Management Fee Bills",
          "desc":     "Ensure you get paid for managing your owner's properties.",
          "wistiaId": "tr7fmizhlj",
          "duration": "6:06",
          "helpUrl":  "https://support.doorloop.com/en/articles/7235560-create-and-pay-management-fee-bills",
          "tourId":   null,
          "appPath":  "/reports"
        },

        {
          "id":       "v-acc-6",
          "title":    "Owner Distributions Overview",
          "desc":     "Learn how to distribute profits to your property owners.",
          "wistiaId": "amlzzxud11",
          "duration": "4:48",
          "helpUrl":  "https://support.doorloop.com/en/articles/8421185-record-an-owner-distribution",
          "tourId":   null,
          "appPath":  "/reports"
        },

        {
          "id":       "v-acc-7",
          "title":    "Bank Reconciliation",
          "desc":     "Reconcile your bank accounts with DoorLoop records.",
          "wistiaId": "f80jhrsfmr",
          "duration": "5:39",
          "helpUrl":  "https://support.doorloop.com/en/articles/6247012-bank-reconciliation-in-doorloop",
          "tourId":   null,
          "appPath":  "/accounting"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [PAYMENTS]  Online & manual payments
     * ───────────────────────────────────────────────────────── */
    "payments": {
      "label": "Payments",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\"/><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"/></svg>",
      "videos": [

        {
          "id":       "v-pay-1",
          "title":    "Setting Up Online Incoming Payments",
          "desc":     "Enable ACH, credit, and debit card payments for tenants to pay you through the tenant portal.",
          "wistiaId": "bzdlte97ff",
          "duration": "6:47",
          "helpUrl":  "https://support.doorloop.com/en/articles/7932446-submit-a-business-verification-application-to-accept-online-payments-powered-by-stripe?q=online+paymen",
          "tourId":   null,
          "appPath":  "/accounting",
          "isNew":    false
        },

        {
          "id":       "v-pay-2",
          "title":    "Setting Up Online Outgoing Payments",
          "desc":     "Enable ACH payments to send payments to your vendors and owners through DoorLoop.",
          "wistiaId": "t294c9xgop",
          "duration": "3:22",
          "helpUrl":  "https://support.doorloop.com/en/articles/10386355-set-up-outgoing-payments-powered-by-checkbook-io-and-plaid",
          "tourId":   "663897",
          "appPath":  "/outgoing-payments/transactions"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [MAINTENANCE]  Requests, work orders, vendors
     * ───────────────────────────────────────────────────────── */
    "maintenance": {
      "label": "Maintenance",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z\"/></svg>",
      "videos": [

        {
          "id":       "v-maint-1",
          "title":    "Creating Tasks",
          "desc":     "Learn how to create and manage tasks.",
          "wistiaId": "i5szoii0n0",
          "duration": "2:37",
          "helpUrl":  "https://support.doorloop.com/en/articles/6093760-create-a-task",
          "tourId":   "664569",
          "appPath":  "/tasks",
          "isNew":    false
        },

        {
          "id":       "v-maint-2",
          "title":    "Tenant Requests",
          "desc":     "Receive and manage tenant maintenance requests.",
          "wistiaId": "61dr2gbk7w",
          "duration": "3:05",
          "helpUrl":  "https://support.doorloop.com/en/articles/7191970-create-a-tenant-request-maintenance-request",
          "tourId":   "664572",
          "appPath":  "/tasks/tenant-requests",
          "isNew":    false
        },

        {
          "id":       "v-maint-3",
          "title":    "Work Order Management",
          "desc":     "Create, assign, and track work orders to completion.",
          "wistiaId": "tn4ch9b3tf",
          "duration": "4:08",
          "helpUrl":  "https://support.doorloop.com/en/articles/6322778-create-a-work-order",
          "tourId":   "664580",
          "appPath":  "/tasks/work-orders"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [COMMUNICATIONS]  Email, SMS, listings
     * ───────────────────────────────────────────────────────── */
    "communications": {
      "label": "Communications",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z\"/></svg>",
      "videos": [

        {
          "id":       "v-comm-1",
          "title":    "Communication Center: Announcements",
          "desc":     "Send individual or bulk messages to your tenants.",
          "wistiaId": "jxsly4gkel",
          "duration": "2:45",
          "helpUrl":  "https://support.doorloop.com/en/articles/6075940-create-a-new-announcement",
          "tourId":   "664487",
          "appPath":  "/communications-center/all-messages"
        },

        {
          "id":       "v-comm-2",
          "title":    "Communication Center: 2 Way SMS Messaging",
          "desc":     "Send and receive SMS messages directly through DoorLoop.",
          "wistiaId": "krxbldyqse",
          "duration": "3:45",
          "helpUrl":  "https://support.doorloop.com/en/articles/9106126-set-up-sms-messaging-for-the-communications-center",
          "tourId":   null,
          "appPath":  "/rentals",
          "isNew":    false
        },

        {
          "id":       "v-comm-3",
          "title":    "Communications Log",
          "desc":     "Track all communication history with tenants and users.",
          "wistiaId": "3xiq7gebjh",
          "duration": "1:58",
          "helpUrl":  "https://support.doorloop.com/en/articles/6193605-communications-log-overview",
          "tourId":   "664509",
          "appPath":  "/communications"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [REPORTS]  Financial reports & custom builder
     * ───────────────────────────────────────────────────────── */
    "reports": {
      "label": "Reports",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"10\"/><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"4\"/><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"14\"/></svg>",
      "videos": [

        {
          "id":       "v-rpt-1",
          "title":    "Reports Overview",
          "desc":     "P&L, balance sheet, rent roll, and more.",
          "wistiaId": "792djhuood",
          "duration": "7:04",
          "helpUrl":  "https://support.doorloop.com/en/articles/8272427-introduction-to-reports-and-filters",
          "tourId":   "664594",
          "appPath":  "/reports"
        },

        {
          "id":       "v-rpt-2",
          "title":    "Filtering & Grouping in Reports",
          "desc":     "Create tailored reports with filters and grouping.",
          "wistiaId": "ikt1yw6muk",
          "duration": "2:43",
          "helpUrl":  "https://support.doorloop.com/en/articles/8272427-introduction-to-reports-and-filters",
          "tourId":   "665335",
          "appPath":  "/reports/transactions-list-report"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [AI]  AI assistant features
     * ───────────────────────────────────────────────────────── */
    "ai": {
      "label": "AI Assistant",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><path d=\"M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1.27c.34-.6.99-1 1.73-1a2 2 0 110 4c-.74 0-1.39-.4-1.73-1H21a7 7 0 01-7 7v1.27c.6.34 1 .99 1 1.73a2 2 0 11-4 0c0-.74.4-1.39 1-1.73V23a7 7 0 01-7-7H3.73c-.34.6-.99 1-1.73 1a2 2 0 110-4c.74 0 1.39.4 1.73 1H5a7 7 0 017-7V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z\"/></svg>",
      "videos": [

        {
          "id":       "v-ai-1",
          "title":    "AI Assistant Agent Overview",
          "desc":     "What the AI Assistant can do across your account.",
          "wistiaId": "u1db49k1fm",
          "duration": "6:38",
          "helpUrl":  "https://support.doorloop.com/en/articles/12312822-doorloop-ai-assistant-agent-overview",
          "tourId":   "665338",
          "appPath":  "/ai-assistant",
          "isNew":    false
        },

        {
          "id":       "v-ai-2",
          "title":    "AI for Bills & Expenses",
          "desc":     "Auto-categorize and process bills with AI.",
          "wistiaId": "3nsl3d492e",
          "duration": "1:51",
          "helpUrl":  "https://support.doorloop.com/en/articles/12084011-doorloop-ai-assistant-for-bills-and-expense-processing",
          "tourId":   "661111",
          "appPath":  "/home/global-new/bill/new"
        },

        {
          "id":       "v-ai-3",
          "title":    "AI Tenant Portal Concierge",
          "desc":     "Let AI handle routine tenant questions and requests automatically.",
          "wistiaId": "o9ij6alyn7",
          "duration": "2:43",
          "helpUrl":  "https://support.doorloop.com/en/articles/12091904-doorloop-ai-assistant-for-the-tenant-portal",
          "tourId":   null,
          "appPath":  "/ai-assistant"
        },

        {
          "id":       "v-ai-4",
          "title":    "AI Listing Description Generator",
          "desc":     "Generate compelling rental listing descriptions with AI in seconds.",
          "wistiaId": "2y8jpofhp3",
          "duration": "2:40",
          "helpUrl":  "https://support.doorloop.com/en/articles/12137914-doorloop-ai-assistant-in-the-unit-listings-wizard",
          "tourId":   null,
          "appPath":  "/rentals"
        },

        {
          "id":       "v-ai-5",
          "title":    "AI Smart Summaries",
          "desc":     "Get instant AI-generated summaries in your reports.",
          "wistiaId": "6v8rm1yyt5",
          "duration": "1:28",
          "helpUrl":  "https://support.doorloop.com/en/articles/12084299-doorloop-ai-assistant-provides-ai-insights-for-reports",
          "tourId":   "661140",
          "appPath":  "/reports/profit-and-loss"
        },

        {
          "id":       "v-ai-6",
          "title":    "AI in Communications Center",
          "desc":     "Use AI to draft, improve, and respond to tenant messages faster.",
          "wistiaId": "o1cw1de8i5",
          "duration": "1:27",
          "helpUrl":  "https://support.doorloop.com/en/articles/12097336-doorloop-ai-assistant-in-the-communication-center",
          "tourId":   "663494",
          "appPath":  "/communications-center/all-messages"
        },

        {
          "id":       "v-ai-7",
          "title":    "AI Inspections",
          "desc":     "Streamline property inspections with AI-assisted reports and documentation.",
          "wistiaId": "34pur4lk9w",
          "duration": "7:10",
          "helpUrl":  "https://support.doorloop.com/en/articles/13134470-ai-inspections-overview",
          "tourId":   null,
          "appPath":  "/tasks"
        }

      ]
    },


    /* ─────────────────────────────────────────────────────────
     *  [WORKFLOWS]  Automation rules
     * ───────────────────────────────────────────────────────── */
    "workflows": {
      "label": "Workflows",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"><polyline points=\"22 12 18 12 15 21 9 3 6 12 2 12\"/></svg>",
      "videos": [

        {
          "id":       "v-wf-1",
          "title":    "Getting Started With Workflows",
          "desc":     "Automate repetitive tasks with rule-based workflows.",
          "wistiaId": "c3pk1wpm3m",
          "duration": "4:11",
          "helpUrl":  "https://support.doorloop.com/en/articles/12903573-getting-started-with-workflows",
          "tourId":   null,
          "appPath":  "/workflows",
          "isNew":    true
        }

      ]
    },

  },


/* ┌──────────────────────────────────────────────────────────────┐
 * │  [PAGE ALIASES]  URL-to-section mapping                      │
 * │                                                              │
 * │  The Help Widget reads the current URL path and uses this    │
 * │  map to decide which section to show automatically.          │
 * │                                                              │
 * │  Format:  "url-segment": "section-key"                       │
 * │  Example: user is on /rentals  →  widget shows "properties"  │
 * │                                                              │
 * │  Only edit this if you add a new section or DoorLoop          │
 * │  introduces new URL paths.                                   │
 * └──────────────────────────────────────────────────────────────┘ */

  "pageAliases": {

    // Dashboard & general
    "overview":         "dashboard",
    "home":             "dashboard",
    "dashboard":        "dashboard",
    "settings":         "dashboard",
    "profile":          "dashboard",
    "user":             "company-settings",
    "users":            "company-settings",

    // Company Settings
    "company":          "company-settings",
    "company-settings": "company-settings",
    "preferences":      "company-settings",

    // Properties & units
    "property":         "properties",
    "properties":       "properties",
    "units":            "properties",
    "unit":             "properties",
    "rentals":          "properties",

    // Tenants
    "tenant":           "tenants",
    "tenants":          "tenants",
    "people":           "tenants",
    "person":           "tenants",
    "prospect":         "tenants",
    "prospects":        "tenants",
    "screening":        "tenants",

    // Leases
    "lease":            "leases",
    "leases":           "leases",
    "leasing":          "leases",
    "renewal":          "leases",

    // Accounting
    "accounting":       "accounting",
    "accounts":         "accounting",
    "chart-of-accounts":"accounting",
    "journal":          "accounting",
    "owner":            "accounting",
    "owners":           "accounting",
    "bill":             "accounting",
    "bills":            "accounting",
    "expense":          "accounting",
    "expenses":         "accounting",
    "reconciliation":   "accounting",
    "bank":             "accounting",
    "budget":           "accounting",
    "check":            "accounting",

    // Payments
    "payment":          "payments",
    "payments":         "payments",
    "epay":             "payments",
    "rent-collection":  "payments",
    "merchant":         "payments",

    // Maintenance
    "maintenance":      "maintenance",
    "tasks":            "maintenance",
    "work-order":       "maintenance",
    "work-orders":      "maintenance",
    "vendor":           "maintenance",
    "vendors":          "maintenance",

    // Communications
    "communication":    "communications",
    "communications":   "communications",
    "messages":         "communications",
    "messaging":        "communications",
    "sms":              "communications",
    "announcement":     "communications",

    // Reports
    "report":           "reports",
    "reports":          "reports",
    "financial":        "reports",

    // AI
    "ai":               "ai",
    "ai-assistant":     "ai",

    // Workflows
    "workflow":         "workflows",
    "workflows":        "workflows",
    "automation":       "workflows",

    // Lead to Lease
    "listing":          "lead-to-lease",
    "listings":         "lead-to-lease",
    "application":      "lead-to-lease",
    "applications":     "lead-to-lease",
    "signature":        "lead-to-lease",
    "signatures":       "lead-to-lease",
    "esign":            "lead-to-lease",
    "esignature":       "lead-to-lease",
    "files":            "lead-to-lease",
    "documents":        "lead-to-lease"
  },


/* ┌──────────────────────────────────────────────────────────────┐
 * │  [TRAINING HUB]  Module groupings for the hub page           │
 * │                                                              │
 * │  Each module is an accordion panel on the Training Hub.      │
 * │  The "sections" array tells it which section(s) to pull      │
 * │  videos from.                                                │
 * │                                                              │
 * │  MODULE FIELDS:                                              │
 * │    id        → Unique slug (used in the URL hash)            │
 * │    title     → Module name in the UI                         │
 * │    subtitle  → Description below the title                   │
 * │    icon      → Emoji shown next to the title                 │
 * │    iconClass → Color: "blue" "navy" "pink" "green" "orange"  │
 * │    sections  → Array of section keys to pull videos from     │
 * └──────────────────────────────────────────────────────────────┘ */

  "trainingHub": {
    "title":    "Welcome to DoorLoop Training",
    "subtitle": "Master every feature at your own pace. Watch the videos, track your progress, and become a DoorLoop power user.",

    "modules": [

      {
        "id":        "getting-started",
        "title":     "Foundations & Navigation",
        "subtitle":  "Set up your account and learn the basics",
        "icon":      "🚀",
        "iconClass": "blue",
        "sections":  ["dashboard"]
      },

      {
        "id":        "company-settings",
        "title":     "General Settings",
        "subtitle":  "Customize company wide notification and fee settings ",
        "icon":      "⚙️",
        "iconClass": "navy",
        "sections":  ["company-settings"]
      },

      {
        "id":        "properties",
        "title":     "Properties & Units",
        "subtitle":  "Add and manage your properties and units",
        "icon":      "🏢",
        "iconClass": "navy",
        "sections":  ["properties"]
      },

      {
        "id":        "tenants-leases",
        "title":     "Tenants & Leases",
        "subtitle":  "Manage tenants, leases, and move-ins",
        "icon":      "👥",
        "iconClass": "pink",
        "sections":  ["leases", "tenants"]       // ← pulls from TWO sections
      },

      {
        "id":        "lead-to-lease",
        "title":     "Lead to Lease",
        "subtitle":  "Manage listings, applications, and e-signatures",
        "icon":      "📋",
        "iconClass": "pink",
        "sections":  ["lead-to-lease"]
      },

      {
        "id":        "accounting",
        "title":     "Accounting & Payments",
        "subtitle":  "Track income, expenses, and collect rent online",
        "icon":      "💰",
        "iconClass": "green",
        "sections":  ["payments", "accounting"]     // ← pulls from TWO sections
      },

      {
        "id":        "maintenance",
        "title":     "Maintenance & Work Orders",
        "subtitle":  "Handle repair requests and track work orders",
        "icon":      "🔧",
        "iconClass": "orange",
        "sections":  ["maintenance"]
      },

      {
        "id":        "communications",
        "title":     "Communications",
        "subtitle":  "Communicate with tenants, owners, vendors, and prospects all in one place",
        "icon":      "🗣️",
        "iconClass": "blue",
        "sections":  ["communications"]
      },

      {
        "id":        "reports",
        "title":     "Reports & Analytics",
        "subtitle":  "Run financial reports and track performance",
        "icon":      "📊",
        "iconClass": "navy",
        "sections":  ["reports"]
      },

      {
        "id":        "ai-assistant",
        "title":     "AI Assistant",
        "subtitle":  "Harness AI tools to automate work, generate content, and get instant insights across your account",
        "icon":      "🤖",
        "iconClass": "blue",
        "sections":  ["ai"]
      },

      {
        "id":        "workflows",
        "title":     "Workflows",
        "subtitle":  "Automate repetitive tasks with rule-based workflows",
        "icon":      "⚡",
        "iconClass": "navy",
        "sections":  ["workflows"]
      }

    ]
  }

};
