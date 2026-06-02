# Everest DigiNotes - MERN Stack

## Setup

### 1. Start MongoDB
Make sure MongoDB is running locally on port 27017.

### 2. Backend
```bash
cd server
npm install
npm start
```

### 3. Frontend
```bash
cd client
npm start
```

### 4. Create Admin Account (only once)
Send a POST request to: `http://localhost:5000/api/auth/setup`
```json
{ "username": "admin", "password": "yourpassword" }
```
You can use Postman, Thunder Client (VS Code extension), or run:
```
curl -X POST http://localhost:5000/api/auth/setup -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"yourpassword\"}"
```

### 5. Login
Go to `http://localhost:3000/login` and use your admin credentials.

## Features
- 📚 Chapter-wise Notes upload
- ❓ Practice Questions upload
- ⭐ Important Notes upload
- 📢 Notice board (with important flag)
- 🔐 Admin-only upload/delete with JWT auth
- 📎 File attachments (PDF, DOC, images)
- 🔍 Filter by class and subject
