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
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return ResponseData({ message: "Không tìm thấy khóa học", status: 404 });
    }

    const unPunlishCourse = await db.course.update({
      where: {
        id: courseId,
        instructorId: userId,
      },
      data: {
        isPublished: false,
      },
    });
    return ResponseData({
      data: unPunlishCourse,
      message: "Khóa học đã được ẩn!",
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({
      message: errorMessage,
      status: 500,
    });
  }
};
