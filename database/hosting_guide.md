# 🌐 Database Hosting Guide (Railway + MySQL)

To host your database on **Railway** and link it instantly to your backend, follow these simple, 1-minute steps. Thanks to the **Auto-Loader Engine** in the backend, you do not need to manually import any SQL files; the server will construct the database for you on Railway automatically!

---

## 🛠️ Step 1: Provision MySQL on Railway

1.  Go to the [Railway Dashboard](https://railway.app/) and sign in (or sign up for a free developer account).
2.  Click the **"New Project"** button at the top right.
3.  From the dropdown list, select **"Provision MySQL"**.
4.  Railway will instantly create a live MySQL instance in the cloud!

---

## 🔑 Step 2: Retrieve your Cloud Connection String

1.  Click on the newly created **MySQL** box in your Railway canvas.
2.  Navigate to the **"Variables"** tab.
3.  Find the variable named `MYSQL_URL` and copy its value. It will look like this:
    ```text
    mysql://root:P1r0a2v9@<your-railway-host>:3306/railway
    ```
    *(Note: If you configured your custom database password as `P1r0a2v9@` during provisioning, Railway will generate a string containing your password!)*

---

## ⚡ Step 3: Connect the Backend

1.  Open your local backend environment configuration: [backend/.env](file:///C:/Users/User/OneDrive/Desktop/likit_DBMS/backend/.env).
2.  Replace the value of `MYSQL_URL` with your copied Railway URL:
    ```env
    MYSQL_URL=mysql://root:P1r0a2v9@<your-railway-host>:3306/railway
    ```
3.  Save the file.

---

## 🚀 Step 4: Automatic Cloud Table Seeding!

You are completely done! The next time the backend boots, it will:
1.  Establish a secure connection pool to your Railway cloud server.
2.  Automatically execute all schema tables creation, seed rows, advanced triggers, and stored procedures on Railway.
3.  Report successful initialization in the console:
    ```text
    ✅ Connected to MySQL database via MYSQL_URL successfully!
    🌱 MySQL Database is empty! Automatically initializing tables...
    ✅ MySQL tables schema loaded successfully!
    ✅ MySQL Triggers loaded successfully!
    ✅ MySQL Stored Procedures loaded successfully!
    ✅ MySQL Database Views loaded successfully!
    ```

*No command line SQL execution or schema dumps needed!*
