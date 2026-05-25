# 🛒 FreshCart — Full-Stack MERN Shopping Cart Application

FreshCart is a modern, premium full-stack e-commerce shopping cart web application built with the **MERN** stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js). It offers a rich, interactive, and seamless user experience for catalog browsing, category filtering, cart management, and secure authenticated checkout preparations.

---

## ✨ Features

- 🔐 **Secure User Authentication**: Robust register, login, and logout functionalities powered by JSON Web Tokens (JWT) stored in secure cookies.
- 📦 **Dynamic Catalog & Search**: Interactive browsing of products with Category-based filtering and clean grid displays.
- 🛒 **Advanced Shopping Cart**: Full shopping cart functionality (add, update quantities, remove, and sync items) tied to user accounts.
- 🎨 **Premium Modern Design**: Built with React, TailwindCSS, and Headless UI for an elegant, responsive interface with beautiful micro-interactions.
- 🛠️ **Seed Script**: Ready-to-use MongoDB database seeding utility to populate products and categories in seconds.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite-powered for lightning-fast HMR)
- **TailwindCSS v3** (Utility-first styling with modern responsive grids)
- **React Router v7** (Declarative routing)
- **Headless UI** (Accessible unstyled UI components)
- **React Icons** (Modern iconography)
- **Axios** (Promise-based HTTP client for API interactions)

### Backend
- **Node.js** & **Express** (Robust RESTful API design)
- **MongoDB** & **Mongoose** (Elegant object modeling and schema validation)
- **Bcrypt.js** (Password hashing security)
- **JSON Web Tokens (JWT)** (Secure stateless session authentication)
- **Cookie Parser** (Cookie-based auth token extraction)

---

## 📂 Project Structure

```text
Shoping Cart/
├── backend/            # Express REST API & Database Models
│   ├── controllers/    # API Request Controllers (auth, cart, etc.)
│   ├── middleware/     # Auth Protection & Custom Middlewares
│   ├── models/         # Mongoose Schemas (User, Product, Category)
│   ├── routes/         # Express Router Endpoints
│   ├── seed.js         # Initial Database Seeding Script
│   └── server.js       # Express Application Entry Point
│
└── frontend/           # React Single Page Application (Vite)
    ├── public/         # Static Public Assets
    ├── src/
    │   ├── assets/     # Styles, Images, Fonts
    │   ├── components/ # Reusable UI Components
    │   ├── context/    # React Context States (Auth, Cart)
    │   ├── pages/      # Route Page Views (Home, Cart, Login, etc.)
    │   ├── App.jsx     # Main Application Router Wrapper
    │   └── main.jsx    # Client Mounting File
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** Atlas cluster or a local MongoDB instance running

---

### 1️⃣ Backend Setup & Configuration

Navigate into the `backend` directory:
```bash
cd backend
```

Install the dependencies:
```bash
npm install
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure your MongoDB Connection URI and JWT Secret in `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/freshcart
JWT_SECRET=your_super_secure_jwt_secret_key
```

**(Optional) Seed the Database**:
To populate the database with initial categories and products for testing, run the seed script:
```bash
node seed.js
```

Start the development server:
```bash
npm run dev
```
The backend server will run on `http://localhost:5000`.

---

### 2️⃣ Frontend Setup & Configuration

Navigate to the `frontend` directory:
```bash
cd ../frontend
```

Install the dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The client app will open automatically at `http://localhost:4001` or the port displayed in your terminal.

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Login and receive a secure HTTP-Only cookie token
- `POST /api/auth/logout` — Clear the secure auth cookie
- `GET /api/auth/profile` — Fetch the currently logged-in user profile (Protected)

### Products (`/api/products`)
- `GET /api/products` — Retrieve all products (supports filtering by category)
- `GET /api/products/:id` — Retrieve details of a specific product

### Categories (`/api/categories`)
- `GET /api/categories` — Get all product categories

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Fetch user's shopping cart items (Protected)
- `POST /api/cart/add` — Add/Update item in shopping cart (Protected)
- `POST /api/cart/remove` — Remove item from shopping cart (Protected)
