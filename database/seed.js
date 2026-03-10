require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Project, Task } = require("./setup");

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash("Password123", 10);
    const user = await User.create({
      username: "demo_user",
      email: "demo@example.com",
      password: hashedPassword
    });

    const project = await Project.create({
      name: "Demo Project",
      description: "Starter project for authenticated tasks system",
      userId: user.id
    });

    await Task.bulkCreate([
      {
        title: "Set up authentication routes",
        completed: true,
        projectId: project.id
      },
      {
        title: "Protect projects endpoint",
        completed: false,
        projectId: project.id
      }
    ]);

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Database seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
