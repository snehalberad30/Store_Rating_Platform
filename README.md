# 🏪 Store Rating Platform

<p align="center">
  <img src="screenshots/admin-dashboard.png" width="900">
</p>

<p align="center">
  Full-Stack Store Rating and Review Platform
</p>

<p align="center">
  Built for the Roxiler FullStack Intern Coding Challenge
</p>

---

## 📌 Project Overview

Store Rating Platform is a full-stack web application that allows users to view registered stores and submit ratings from **1 to 5**.

The application provides a single login system with role-based access for:

- System Administrator
- Normal User
- Store Owner

Each role has different permissions and dashboard functionality.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Axios
- CSS
- Vite

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt.js

### Database

- MySQL

---

# 📸 Application Screenshots

## 🔐 Login Page

<img src="screenshots/login.png" width="900">

---

## 👨‍💼 Admin Dashboard

<img src="screenshots/admin-dashboard.png" width="900">

The administrator dashboard provides:

- Total Users
- Total Stores
- Total Ratings
- Add User
- Add Admin
- Add Store Owner
- Add Store
- User listing
- Store listing
- Filtering
- Sorting
- User details

---

## 👤 Normal User Dashboard

<img src="screenshots/user-dashboard.png" width="900">

Normal users can:

- View all registered stores
- Search stores
- View overall ratings
- View their submitted rating
- Submit ratings
- Modify ratings
- Logout

---

## 🏪 Store Owner Dashboard

<img src="screenshots/owner-dashboard.png" width="900">

Store owners can:

- View their store
- View average rating
- View total ratings
- View users who submitted ratings
- Logout

---

# 👨‍💼 System Administrator

The System Administrator can:

- Login
- View dashboard statistics
- Add normal users
- Add administrators
- Add store owners
- Add stores
- Assign stores to store owners
- View users
- View stores
- Filter users by:
  - Name
  - Email
  - Address
  - Role
- Filter stores by:
  - Name
  - Email
  - Address
- Sort listings in ascending and descending order
- View detailed user information
- View store owner information and associated store ratings
- Logout

---

# 👤 Normal User

Normal users can:

- Sign up
- Login
- View all registered stores
- Search stores by name
- Search stores by address
- View store address
- View overall store rating
- View their submitted rating
- Submit a rating between 1 and 5
- Modify their submitted rating
- Change their password
- Logout

---

# 🏪 Store Owner

Store owners can:

- Login
- View their store
- View average store rating
- View total number of ratings
- View users who submitted ratings
- Change their password
- Logout

---

# ⭐ Rating System

Users can submit ratings between:

```text
1 ⭐
2 ⭐⭐
3 ⭐⭐⭐
4 ⭐⭐⭐⭐
5 ⭐⭐⭐⭐⭐
