import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { title, categoryId, subCategoryId } = await req.json();
    const newCourse = await db.course.create({
      data: {
        title,
        categoryId,
        subCategoryId,
        instructorId: userId,
      },
    });
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.log("[courses_POST] POST / error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
