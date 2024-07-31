import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const hanleAuth = () => {
  const { userId } = auth();
  if (!userId) {
    throw new UploadThingError("Unauthorized");
  }
  return { userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Upload ảnh thumbnail cho khóa học
  courseThumbnail: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(hanleAuth)
    .onUploadComplete(() => {}),
  // Upload video cho bài học
  videoLessonUrl: f({
    video: { maxFileSize: "512GB", maxFileCount: 1 },
  })
    .middleware(hanleAuth)
    .onUploadComplete(() => {}),
  // Upload file tài nguyên cho bài học
  lessonResource: f(["image", "video", "pdf", "text", "audio"])
    .middleware(hanleAuth)
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
