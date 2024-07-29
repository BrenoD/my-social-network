Social Network Project 🚀
Overview 🌐
This project is a social network application developed using React for the frontend and Go for the backend. It allows users to create accounts, authenticate, post content, and manage their posts.

Frontend 💻
The frontend is built with React. It provides a user interface for interacting with the social network.

Running the Frontend 🚀
To start the frontend development server, navigate to the frontend directory and run:

bash
Copiar código
npm run dev
This will start the development server and open the application in your default web browser.

Setup 🛠️
Database Schema 🗄️
Run the following SQL commands to set up the database schema:

sql
Copiar código
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
License 📜
This project is licensed under the MIT License. See the LICENSE file for details.
![image](https://github.com/user-attachments/assets/88be3a4b-180c-47ae-bb21-d1bd81efd4d8)
