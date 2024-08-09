import EditCourseForm from "@/components/courses/EditCourseForm";
import AlertBanner from "@/components/custom/AlertBanner";
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
    include: {
      lessons: true,
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

  const requiredFields = [
    course.title,
    course.description,
    course.thumbnail,
    course.levelLearnerId,
    course.price,
    course.subTitle,
    course.lessons.some((lesson) => lesson.isPublished),
  ];
  const requiredFieldsCount = requiredFields.length;
  const missingFields = requiredFields.filter((field) => !Boolean(field));
  const missingFiledsCount = missingFields.length;
  const isCompleted = requiredFields.every(Boolean);
  return (
    <div className="p-10">
      <AlertBanner
        isCompleted={isCompleted}
        missingFieldsCount={missingFiledsCount}
        requiredFieldsCount={requiredFieldsCount}
      />
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
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default CourseBasicInfo;
