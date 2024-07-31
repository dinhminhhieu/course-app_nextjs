import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { lessonlist } = await req.json();
    if (!lessonlist) {
      return new NextResponse("Bad Request", { status: 400 });
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

    for (let lesson of lessonlist) {
      await db.lesson.update({
        where: {
          id: lesson.id,
        },
        data: {
          position: lesson.position,
        },
      });
    }
    return new NextResponse("Sắp xếp thành công!", { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NextResponse(errorMessage, { status: 500 });
  }
};
