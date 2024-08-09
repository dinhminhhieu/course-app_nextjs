import { db } from "@/lib/db";
import ResponseData from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId } = params;
    if (!userId) {
      return ResponseData({
        message: "Bạn cần đăng nhập để thực hiện thao tác này!",
        status: 401,
      });
    }

    const course = await db.course.findUnique({
      where: {
        instructorId: userId,
        id: courseId,
      },
      include: {
        lessons: {
          include: {
            muxData: true,
          },
        },
      },
    });
    if (!course) {
      return ResponseData({ message: "Không tìm thấy khóa học", status: 404 });
    }
    if (
      !course.title ||
      !course.description ||
      !course.thumbnail ||
      !course.levelLearnerId ||
      !course.price ||
      !course.subTitle
    ) {
      return ResponseData({
        message: "Vui lòng điền đầy đủ thông tin khóa học!",
        status: 400,
      });
    }

    const isPublishLesson = course.lessons.some((lesson) => lesson.isPublished);
    if (!isPublishLesson) {
      return ResponseData({
        message: "Khóa học chưa có bài học nào được publish!",
        status: 400,
      });
    }

    const publishCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: userId,
      },
      data: {
        isPublished: true,
      },
    });
    return ResponseData({
      data: publishCourse,
      message: "Publish khóa học thành công!",
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({ message: errorMessage, status: 500 });
  }
};
