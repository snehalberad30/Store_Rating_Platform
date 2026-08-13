# Store Rating Platform

A full-stack web application developed for the Roxiler FullStack Intern Coding Challenge.

## Tech Stack

### Frontend
- React.js
- Axios
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt.js

### Database
- MySQL

## User Roles

The application supports three roles:

1. System Administrator
2. Normal User
3. Store Owner

## Features

### System Administrator
- Admin login
- Dashboard with total users, stores and ratings
- Add users
- Add administrators
- Add store owners
- Add stores
- Assign stores to store owners
- View users
- View stores
- Filter users and stores
- Sort listings
- View user details
- Logout

### Normal User
- User registration
- User login
- View all stores
- Search stores by name and address
- View overall store rating
- Submit rating from 1 to 5
- Modify submitted rating
- Logout

### Store Owner
- Store owner login
- View average store rating
- View total ratings
- View users who submitted ratings
- Logout

## Validation

- Name: 20–60 characters
- Address: maximum 400 characters
- Password: 8–16 characters
- Password requires at least one uppercase letter
- Password requires at least one special character
- Email validation
- Rating: 1–5

## Authentication

JWT-based authentication is implemented with role-based authorization.

Passwords are securely hashed using bcrypt.

## Project Structure

```text
store-rating-platform/
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── frontend/
    ├── src/
    ├── package.json
    └── ...
