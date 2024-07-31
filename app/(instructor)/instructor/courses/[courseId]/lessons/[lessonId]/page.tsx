import AlertBanner from "@/components/custom/AlertBanner";
import EditLessonForm from "@/components/lessons/EditLessonForm";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LessonPage = async ({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const lesson = await db.lesson.findUnique({
    where: {
      id: params.lessonId,
      courseId: params.courseId,
    },
    include: {
      resources: true,
      muxData: true,
    },
  });

  if (!lesson) {
    return redirect(`/instructor/courses/${params.courseId}/lessons`);
  }

  const requiredFields = [
    lesson.titleLesson,
    lesson.description,
    lesson.videoLessonUrl,
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
      <EditLessonForm
        courseId={params.courseId}
        lesson={lesson}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default LessonPage;
