import { db } from "@/lib/db";
import ResponseData from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Khóa học không tồn tại!", { status: 404 });
    }

    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
        courseId: params.courseId,
      },
    });
    if (!lesson) {
      return new NextResponse("Bài học không tồn tại!", { status: 404 });
    }

    const { name, fileUrl } = await req.json();
    const resource = await db.resource.create({
      data: {
        name,
        fileUrl,
        lessonId: params.lessonId,
      },
    });
    return ResponseData({
      message: "Tạo tài nguyên bài học thành công!",
      data: resource,
      status: 201,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NextResponse(errorMessage, { status: 500 });
  }
};
