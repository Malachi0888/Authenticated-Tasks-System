require("dotenv").config();
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const dbName = process.env.DB_NAME || "task_management.db";
const dbType = process.env.DB_TYPE || "sqlite";
const storagePath = path.resolve(__dirname, dbName);

const sequelize = new Sequelize({
  dialect: dbType,
  storage: storagePath,
  logging: false
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "users",
    timestamps: false
  }
);

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "projects",
    timestamps: false
  }
);

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "tasks",
    timestamps: false
  }
);

User.hasMany(Project, { foreignKey: "userId", onDelete: "CASCADE" });
Project.belongsTo(User, { foreignKey: "userId" });

Project.hasMany(Task, { foreignKey: "projectId", onDelete: "CASCADE" });
Task.belongsTo(Project, { foreignKey: "projectId" });

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Database setup completed.");
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { sequelize, User, Project, Task, setupDatabase };
