const express = require('express');
const app = express();
const PORT = 3000;

// قاعدة بيانات وهمية
let users = [];

app.use(express.json());

// تسجيل الدخول باستخدام Google
app.post('/api/auth/google', (req, res) => {
    const { token } = req.body;
    // تحقق وهمي من الرمز المميز
    if (token) {
        const user = { id: users.length + 1, name: "User " + users.length, token };
        users.push(user);
        res.status(200).json({ message: 'Login successful', user });
    } else {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// عرض المستخدمين
app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
