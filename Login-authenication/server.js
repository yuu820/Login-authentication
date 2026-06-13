require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");
const app = express();

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("views"));

// USER REGISTRATION API
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "ユーザーネームとパスワードは必要です" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userUuid = crypto.randomUUID();

        const smst= db.prepare('INSERT INTO users (uuid, username, password_hash) VALUES (?, ?, ?)')
        smst.run(userUuid, username, hashedPassword);

        res.status(201).json({ message: "ユーザーが正常に登録されました",uuid: userUuid });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({ message: "ユーザーネームは既に存在しています" });
        }
        console.error(error);
        res.status(500).json({ message: "サーバーエラー" });
    }
});

// USER LOGIN API
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = stmt.get(username);
    if (!user) {
        return res.status(401).json({ message: "ユーザーネームまたはパスワードが間違っています" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "ユーザーネームまたはパスワードが間違っています" });
    }

    const token = jwt.sign({ uuid: user.uuid ,username:user.username}, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("auth_token", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production" ,
        sameSite: "strict" ,
        maxAge: 3600000 });  
    res.json({ message: "ログインに成功しました" ,uuid : user.uuid});
});

// TEST API
app.get("/api/verify", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ message: "認証トークンが見つかりません" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ authenticated: true,user:decoded });
    } catch (error) {
        res.status(401).json({ authenticated: false, error: "無効な認証トークンです" });
    }
});
app.listen(3000);