import { db } from "@/lib/db";
import ResponseData from "@/lib/response";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_ACCESS_TOKEN_ID,
  tokenSecret: process.env.MUX_SECRET_KEY,
});

export const POST = async (
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId, lessonId } = params;
    const values = await req.json();
    if (!userId) {
      return ResponseData({ message: "Unauthorized", status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return ResponseData({ message: "Khóa học không tồn tại!", status: 404 });
    }

    const lesson = await db.lesson.update({
      where: {
        id: lessonId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });
    if (!lesson) {
      return ResponseData({ message: "Bài học không tồn tại!", status: 404 });
    }

    if (values.videoLessonUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          lessonId: lessonId,
        },
      });
      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    const asset = await mux.video.assets.create({
      input: values.videoLessonUrl,
      playback_policy: ["public"],
      encoding_tier: "baseline",
      test: false,
    });

    await db.muxData.create({
      data: {
        assetId: asset.id,
        playbackId: asset.playback_ids ? asset.playback_ids[0].id : "",
        lessonId: lessonId,
      },
    });
    return ResponseData({
      message: "Khởi tạo thông tin bài học thành công!",
      data: lesson,
      status: 201,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({ message: errorMessage, status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) => {
  try {
    const { userId } = auth();
    const { courseId, lessonId } = params;
    if (!userId) {
      return ResponseData({ message: "Unauthorized", status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        instructorId: userId,
      },
    });
    if (!course) {
      return ResponseData({ message: "Khóa học không tồn tại!", status: 404 });
    }

    const lesson = await db.lesson.findUnique({
      where: {
        id: lessonId,
        courseId: courseId,
      },
    });
    if (!lesson) {
      return ResponseData({ message: "Bài học không tồn tại!", status: 404 });
    }

    if (lesson.videoLessonUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          lessonId: lessonId,
        },
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    await db.lesson.delete({
      where: {
        id: lessonId,
        courseId: courseId,
      },
    });

    const publishedLessons = await db.lesson.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    });
    if (publishedLessons.length === 0) {
      await db.course.update({
        where: {
          id: courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return ResponseData({
      message: "Xóa bài học thành công!",
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return ResponseData({ message: errorMessage, status: 500 });
  }
};
