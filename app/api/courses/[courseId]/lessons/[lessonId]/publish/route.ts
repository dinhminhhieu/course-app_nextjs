import { db } from "@/lib/db";
import ResponseData from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";

export const POST = async (
  req: NextApiRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId, lessonId } = params;
    if (!userId) {
      return ResponseData({ message: "Unauthorized", status: 401 });
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return ResponseData({ message: "Không tìm thấy khóa học", status: 404 });
    }

    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        courseId: courseId,
      },
    });
    if (!lesson) {
      return ResponseData({ message: "Không tìm thấy bài học", status: 404 });
    }

    const muxData = await db.muxData.findUnique({
      where: {
        lessonId: lessonId,
      },
    });
    if (!muxData) {
      return ResponseData({
        message: "Không tìm thấy dữ liệu Mux",
        status: 404,
      });
    }

    if (
      !lesson ||
      !muxData ||
      !lesson.titleLesson ||
      !lesson.description ||
      !lesson.videoLessonUrl
    ) {
      return ResponseData({
        message: "Vui lòng điền đủ thông tin bài học",
        status: 400,
      });
    }
    await db.lesson.update({
      where: {
        id: lessonId,
        courseId: courseId,
      },
      data: {
        isPublished: true,
      },
    });
    return ResponseData({ message: "Bài học đã được Publish", status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({ message: errorMessage, status: 500 });
  }
};
