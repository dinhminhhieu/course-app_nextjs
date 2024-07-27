import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = db.course.findUnique({
      where: {
        id: params.courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return new NextResponse("Khóa học không tồn tại!", { status: 404 });
    }

    const lastLesson = await db.lesson.findFirst({
      where: {
        courseId: params.courseId,
      },
      orderBy: {
        position: "desc",
      },
    });

    const newPosition = lastLesson ? lastLesson.position + 1 : 0;
    const { title } = await req.json();
    const newLesson = await db.lesson.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
      },
    });
    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.log("[lessons_POST] POST / error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
