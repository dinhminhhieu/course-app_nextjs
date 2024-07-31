import { db } from "@/lib/db";
import ResponseData from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_ACCESS_TOKEN_ID,
  tokenSecret: process.env.MUX_SECRET_KEY,
});

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new NextResponse(errorMessage, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { courseId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return ResponseData({ message: "Unauthorized", status: 401 });
    }
    const { courseId } = params;
    const course = await db.course.findUnique({
      where: { id: courseId, instructorId: userId },
      include: {
        lessons: {
          include: {
            resources: true,
            muxData: true,
          },
        },
      },
    });
    if (!course) {
      return ResponseData({ message: "Khóa học không tồn tại!", status: 404 });
    }

    for (let lesson of course.lessons) {
      if (lesson.muxData?.assetId) {
        await mux.video.assets.delete(lesson.muxData.assetId);
      }
    }

    await db.course.delete({ where: { id: courseId } });
    return ResponseData({ message: "Xóa khóa học thành công!", status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({ message: errorMessage, status: 500 });
  }
};
