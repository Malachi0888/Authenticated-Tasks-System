require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { sequelize, User, Project, Task } = require("./database/setup");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
  })
);

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required." });
  }

  req.user = {
    id: req.session.userId,
    email: req.session.email,
    username: req.session.username
  };

  return next();
}

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to register user." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.username = user.username;

    return res.status(200).json({ message: "Login successful." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to log in." });
  }
});

app.post("/api/logout", (req, res) => {
  if (!req.session) {
    return res.status(200).json({ message: "Logged out successfully." });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ error: "Failed to log out." });
    }
    return res.status(200).json({ message: "Logged out successfully." });
  });
});

app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      include: [{ model: Task }]
    });
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch projects." });
  }
});

app.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          where: { userId: req.user.id }
        }
      ]
    });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, requireAuth };
