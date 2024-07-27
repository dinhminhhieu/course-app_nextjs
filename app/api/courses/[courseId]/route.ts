import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { courseId } = params;
    const requestData = await req.json();
    const updatedCourse = await db.course.update({
      where: { id: courseId, instructorId: userId },
      data: { ...requestData },
    });
    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error) {
    console.log("[courseID_PATCH] PATCH / error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
