import EditCourseForm from "@/components/courses/EditCourseForm";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CourseBasicInfo = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: userId,
    },
  });

  if (!course) {
    return redirect("/courses");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      subCategories: true,
    },
  });

  const levelLearner = await db.levelLearner.findMany();
  return (
    <div className="p-10">
      <EditCourseForm
        course={course}
        categories={categories.map((category) => ({
          label: category.name,
          value: category.id,
          subCategories: category.subCategories.map((subCategory) => ({
            label: subCategory.name,
            value: subCategory.id,
          })),
        }))}
        levelLearner={levelLearner.map((levelLearerItem) => ({
          label: levelLearerItem.name,
          value: levelLearerItem.id,
        }))}
      />
    </div>
  );
};

export default CourseBasicInfo;
