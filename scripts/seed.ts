const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    const categories = [
      {
        name: "IT & Phần mềm",
        subCategories: {
          create: [
            { name: "Web Development" },
            { name: "Data Science" },
            { name: "Cybersecurity" },
            { name: "Khác" },
          ],
        },
      },
      {
        name: "Kinh doanh",
        subCategories: {
          create: [
            { name: "E-Commerce" },
            { name: "Marketing" },
            { name: "Finance" },
            { name: "Khác" },
          ],
        },
      },
      {
        name: "Thiết kế",
        subCategories: {
          create: [
            { name: "Graphic Design" },
            { name: "3D & Animation" },
            { name: "Interior Design" },
            { name: "Khác" },
          ],
        },
      },
      {
        name: "Sức khỏe",
        subCategories: {
          create: [
            { name: "Fitness" },
            { name: "Yoga" },
            { name: "Nutrition" },
            { name: "Khỏe" },
          ],
        },
      },
    ];

    // Tạo category dựa vào subCategories
    for (const category of categories) {
      await database.category.create({
        data: {
          name: category.name,
          subCategories: category.subCategories,
        },
        include: {
          subCategories: true,
        },
      });
    }

    // Tạo level người học
    await database.levelLearner.createMany({
      data: [
        { name: "Beginner (Cơ bản)" },
        { name: "Intermediate (Nâng cao)" },
        { name: "Advanced (Chuyên sâu)" },
        { name: "All (Tất cả)" },
      ],
    });

    console.log("Seed data successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    await database.$disconnect();
  }
}

main();
