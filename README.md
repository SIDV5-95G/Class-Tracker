# ROSTER

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

**ROSTER** is a robust, centralized web application engineered specifically for Class Representatives (CRs) and students. It eliminates the chaos of scattered WhatsApp messages and spreadsheets by providing a unified dashboard to track, manage, and monitor academic assignments, lab submission deadlines, and important class announcements.

---

## 🚀 Key Features

* **Centralized Deadline Management:** A clean dashboard displaying upcoming, pending, and completed lab submissions and academic assignments.
* **Secure Authentication Workflow:** Built on Supabase Auth, ensuring that only authorized students and class representatives can access or modify class data.
* **Role-Based Access Control:** Distinct permissions allowing Class Representatives to create, edit, and delete deadlines, while students have read-only access to their respective dashboards.
* **Real-Time Cloud Sync:** Powered by a Supabase PostgreSQL backend, ensuring that whenever a CR updates a deadline, it instantly reflects for the entire class.
* **Responsive UI:** Built with Next.js, delivering a seamless experience across desktop, tablet, and mobile devices so students can check deadlines on the go.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Styling:** CSS Modules / Tailwind CSS (adaptable based on configuration)
* **Routing:** Next.js App/Pages Router

### Backend & Database
* **BaaS:** [Supabase](https://supabase.com/)
* **Database:** PostgreSQL (managed via Supabase)
* **Authentication:** Supabase Auth (Email/Password, OAuth options)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and set up:
* **Node.js** (v18.0.0 or higher recommended)
* **npm**, **yarn**, or **pnpm**
* A [Supabase](https://supabase.com/) account and a new project created.
* Git for version control.

---

## ⚙️ Installation & Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/CLASS_TRACKER.git
cd CLASS_TRACKER
```

**2. Install dependencies**
```bash
npm install
# or
yarn install
```

**3. Configure Environment Variables**
Create a `.env.local` file in the root of your project. You will need to extract these keys from your Supabase Project Dashboard (Project Settings > API).

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-super-long-anon-key-here
```

**4. Supabase Database Setup**
Navigate to the SQL Editor in your Supabase dashboard and set up your core tables. Example schema for the assignments table:

```sql
CREATE TABLE assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  type text CHECK (type IN ('Lab', 'Theory', 'Project')),
  created_at timestamp with time zone DEFAULT now()
);

-- Remember to set up Row Level Security (RLS) policies based on user roles!
```

**5. Run the Development Server**
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

---

## 📂 Project Structure

```text
CLASS_TRACKER/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable UI components (Cards, Modals, Nav)
│   ├── lib/                # Utility functions and Supabase client config
│   │   └── supabase.js     # Supabase initialization
│   ├── styles/             # Global CSS and Tailwind directives
│   └── types/              # TypeScript interfaces (if using TS)
├── .env.local.example      # Example environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

---

## 💡 Usage Workflow

1. **Onboarding:** The Class Representative creates an account and provisions access (or shares an invite link) with the class batch.
2. **Adding a Task:** The CR navigates to the admin dashboard, clicks "Add New Deadline," selects the category (Lab/Assignment), inputs the subject, and sets the due date/time.
3. **Student View:** Students log in and instantly see a chronologically sorted list of what is due next, preventing last-minute panic.
4. **Completion:** As deadlines pass, they are automatically archived or moved to a "Past Deadlines" view to keep the main interface uncluttered.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
