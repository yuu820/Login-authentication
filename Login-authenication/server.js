require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");
const app = express();;

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("views"));
// XSS PROTECTION
function sanitizeInput(input) {
  return input.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
//PASSWORD STRENGTH CHECK
function isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}
// ADMIN CHECK
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ message: "認証トークンが見つかりません" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const stmt = db.prepare("SELECT * FROM users WHERE uuid = ?");
        const user = stmt.get(decoded.uuid);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "管理者権限が必要です" });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "無効な認証トークンです" });
    }
};
// RECAPTCHA VERIFICATION
const verifyRecaptcha = async (token,action) => {
    const siteKey = process.env.RECAPTCHA_KEY;
    const projectID = process.env.GCP_PROJECT_ID;
    const apiKey = process.env.GCP_API_KEY;
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;
    try {
        //CREATE ASSESMENT
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: {
                    token: token,
                    siteKey: siteKey,
                    expectedAction: action
                }
            })
        });
        const data = await response.json();
        //Check THE RISK SCORE
        if (data.tokenProperties && data.tokenProperties.valid && data.riskAnalysis.score >=0.5) {
            console.log(data.riskAnalysis.score)
            return true;
        } else {
            console.log(data.riskAnalysis.score)
            return false;
        }
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return false;
    }
};

// USER REGISTRATION API
app.post("/api/register", async (req, res) => {
    const { username, password, recaptchaToken } = req.body;
    //INPUT VALIDATION
    if (!isStrongPassword(password)){
        return res.status(400).json({ message: "パスワードは8文字以上で、大文字、小文字、数字を含む必要があります" });
    }
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);
    if (!sanitizedUsername || !sanitizedPassword) {
        return res.status(400).json({ message: "ユーザーネームとパスワードは必要です" });
    }
    //ROBOT CHECK
    if (!recaptchaToken) {
        return res.status(400).json({ message: "reCAPTCHAの検証に失敗しました" });
    }
    const ishuman = await verifyRecaptcha(recaptchaToken,'signup');
    if (!ishuman) {
        return res.status(403).json({ message: "BOTとして検出されました" });
    }
    //USER CREATION
    try {
        const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);
        const userUuid = crypto.randomUUID();

        const smst= db.prepare('INSERT INTO users (uuid, username, password_hash) VALUES (?, ?, ?)')
        smst.run(userUuid, sanitizedUsername, hashedPassword);

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
    const { username, password, recaptchaToken } = req.body;
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);
    //USER CHECK
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = stmt.get(sanitizedUsername);
    if (!user) {
        return res.status(401).json({ message: "ユーザーネームまたはパスワードが間違っています" });
    }

    //PASSWORD CHECK
    const isMatch = await bcrypt.compare(sanitizedPassword, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: "ユーザーネームまたはパスワードが間違っています" });
    }
    //ACTIVE CHECK
    if (user.status === "pending") {
        return res.status(403).json({ message: "ユーザーはまだ承認されていません" });
    }
    if (user.status === "suspended") {
        return res.status(403).json({ message: "ユーザーは停止されています" });
    }
    //ROBOT CHECK
    if (!recaptchaToken) {
        return res.status(403).json({ message: "reCAPTCHAの検証に失敗しました" });
    }
    const ishuman = await verifyRecaptcha(recaptchaToken,'login');
    if (!ishuman) {
        return res.status(403).json({ message: "BOTとして検出されました" });
    }
    //JWT TOKEN GENERATION
    const token = jwt.sign(
        { uuid: user.uuid ,username:user.username,role:user.role}, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("auth_token", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production" ,
        sameSite: "lax" ,
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

//FOR ADMIN

//GET USER INFORMATION
app.get("/api/admin/users", verifyAdmin, (req, res) => {
    const stmt = db.prepare("SELECT id, uuid, username, status, role, created_at FROM users");
    const users = stmt.all();
    res.json(users);
    console.log(users);
});

//UPDATE USER STATUS
app.patch("/api/admin/users/:uuid/status", verifyAdmin, (req, res) => {
    const { uuid } = req.params;
    const { status } = req.body;
    if (!["pending", "active", "suspended"].includes(status)) {
        return res.status(400).json({ message: "無効なステータスです" });
    }
    const stmt = db.prepare("UPDATE users SET status = ? WHERE uuid = ?");
    const result = stmt.run(status, uuid);
    if (result.changes === 0) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
    }
    res.json({ message: "ユーザーステータスが更新されました" });
});

//DELETE USER
app.delete("/api/admin/users/:uuid", verifyAdmin, (req, res) => {
    const { uuid } = req.params;
    const stmt = db.prepare("DELETE FROM users WHERE uuid = ?");
    const result = stmt.run(uuid);

    if (result.changes === 0) {
        return res.status(404).json({ message: "ユーザーが見つかりません" });
    }
    res.json({ message: "ユーザーが削除されました" });
});
app.listen(3000);