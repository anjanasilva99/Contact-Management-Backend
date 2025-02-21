# Contact Management Backend

A RESTful API backend for managing contacts built with NestJS, TypeORM, and PostgreSQL.

## Features

- CRUD operations for contacts
- Input validation with class-validator
- PostgreSQL database integration
- Error handling and validation
- Search functionality
- Automated testing support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contact-management-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file based on .env.sample:
```bash
cp .env.sample .env
```

4. Update the .env file with your database credentials and other configurations.

Database Setup

1.Create a PostgreSQL database
2.Configure the database connection in .env file


Running the Application
```bash
npm run start:dev
```