# Social Network Project 🚀<br />
## Overview 🌐<br />
This project is a social network application developed using React for the frontend and Go for the backend. It allows users to create accounts, authenticate, post content, and manage their posts.<br />
<br />
## Frontend 💻<br />
The frontend is built with React. It provides a user interface for interacting with the social network.<br />
<br />
## Running the Frontend 🚀<br />
To start the frontend development server, navigate to the frontend directory and run:<br />
```bash
npm run dev
```
<br />
This will start the development server and open the application in your default web browser.<br />
<br />

## Setup 🛠️<br />
Database Schema 🗄️<br />
Run the following SQL commands to set up the database schema:<br />

```sql
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
```

![image](https://github.com/user-attachments/assets/8f239890-263b-4bc8-bea9-b5964c25c7ca)

## License 📜<br />
This project is licensed under the MIT License. See the LICENSE file for details.<br />
<br />
## Author 📝
Breno Dias Rodrigues<br />
Curriculum: https://brenod.github.io/curriculum/<br />
Email: dias2579@gmail.com

