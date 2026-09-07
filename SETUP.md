# University Examination ERP - Setup & Operating Guide

This document describes how to configure, migrate, seed, and run the University Examination ERP system in development and production environments.

---

## 1. Environment Configuration

Copy `.env.example` to `.env` inside the `server/` directory (or root) and fill in your credentials:

```bash
cp .env.example server/.env
```

Ensure `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` are configured.

---

## 2. Database Migration

Run the versioned SQL schema migrations to set up MySQL tables, indexes, and foreign keys:

```bash
cd server
npm run migrate
```

---

## 3. Initial Admin Account Creation (One-Time Setup)

To bootstrap the system with a single secure admin account (password hashed using bcrypt, cost factor 12):

```bash
cd server
npm run setup:admin
```

> [!NOTE]
> No demo users, demo students, or fake marks exist by default. The system starts clean.

---

## 4. (Optional) Local Development Seeding

For local testing only, you can run the developer seed script:

```bash
cd server
npm run seed:dev
```

*Never execute this command in staging or production environments.*

---

## 5. Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```

### Start Frontend Client
```bash
cd client
npm run dev
```

---

## 6. Running Automated Tests

To run the Supertest + Jest test suite:

```bash
cd server
npm run test
```
