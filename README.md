# ConnectU - Find Your Perfect Team 🚀

ConnectU is a dedicated platform for college students (specifically NIT Patna) to find teammates, join events, and showcase their skills. It bridges the gap between students looking to participate in hackathons, sports, or cultural events and teams looking for the right talent.

## Key Features ✨

### 🔐 Authentication & Security
- **Secure Login/Signup**: Implementation using Firebase Authentication.
- **Email Verification**: Access is restricted until email verification is complete.
- **Profile Completion**: Users must complete their profile to access interactive features like joining teams or sending invites.

### 🤝 Team Management
- **Create Teams**: Users can create teams for specific events.
- **Join Teams**: Browse existing teams and request to join.
- **Invite Members**: Team leaders can invite users directly from the "Discover" tab.
- **Manage Requests**: Accept or reject join requests with ease.

### 🔍 Discovery & Matching
- **Discover Talent**: Browse student profiles filtered by skills, branch, or availability.
- **Smart Matching**: The "For You" section suggests teams and events based on your profile interests and skills.
- **Category-Based Filtering**: Filter events and teams by Research, Hackathon, Startup, Sports, Esports, and Cultural categories.

### 📱 User Experience
- **Progressive Web App (PWA)**: Installable as a native-like app on mobile and desktop.
- **Real-time Updates**: Instant notifications for join requests and team updates.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **Context-Aware Search**: Intelligent search bar that adapts to the current section (Events, Teams, or Users).

## Tech Stack 🛠️

- **Frontend**: [React](https://reactjs.org/) (Vite)
- **Styling**: CSS3 with Glassmorphism aesthetic
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Hosting)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/) & [React Icons](https://react-icons.github.io/react-icons/)

## Getting Started 🏁

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/checkup_connectU.git
    cd checkup_connectU
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_API_KEY=your_api_key
    VITE_AUTH_DOMAIN=your_auth_domain
    VITE_PROJECT_ID=your_project_id
    VITE_STORAGE_BUCKET=your_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_APP_ID=your_app_id
    VITE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## PWA & Updates 🔄
ConnectU is a PWA. When a new version is deployed:
1.  A "New version available" toast will appear at the top.
2.  Clicking "Update" will reload the application to the latest version.
3.  The app handles caching strategies to ensure fast loads while keeping content fresh.

## Project Structure 📂

```
src/
├── assets/         # Images and static assets
├── components/     # Reusable UI components (Modals, Cards, Navbar)
├── context/        # React Context API (Auth, Teams, Toast)
├── hooks/          # Custom hooks (useFirestore, useProfileCheck)
├── pages/          # Application pages (Home, Login, Dashboard)
├── styles/         # Global styles and specific component CSS
└── utils/          # Helper functions (Time formatting, Email service)
```

## Contributors 👥

- **Shivam Singh**
- **Kartikey**

---
Built with ❤️ for NIT Patna.