"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lesson, MuxData, Resource } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TextEditor from "../custom/TextEditor";
import UploadFile from "../custom/UploadFile";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ResourceForm from "./ResourceForm";
import MuxPlayer from "@mux/mux-player-react";
import AlertDialogDelete from "../custom/AlertDialogDelete";
import PublishButton from "../custom/PublishButton";

const formSchema = z.object({
  titleLesson: z.string().min(2, {
    message: "Tiêu đề bài học là bắt buộc và phải có ít nhất 2 ký tự",
  }),
  description: z.string().optional(),
  videoLessonUrl: z.string().optional(),
  isFree: z.boolean().optional(),
});

interface EditLessonFormProps {
  lesson: Lesson & { resources: Resource[]; muxData?: MuxData | null };
  courseId: string;
  isCompleted: boolean;
}

const EditLessonForm = ({
  lesson,
  courseId,
  isCompleted,
}: EditLessonFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titleLesson: lesson.titleLesson,
      description: lesson.description || "",
      videoLessonUrl: lesson.videoLessonUrl || "",
      isFree: lesson.isFree,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `/api/courses/${courseId}/lessons/${lesson.id}`,
        values
      );
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      toast.error("Cập nhật khóa học không thành công!");
      console.log("error", error);
    }
  };

  const onDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/courses/${courseId}/lessons/${lesson.id}`
      );
      toast.success(response.data.message);
      router.push(`/instructor/courses/${courseId}/lessons`);
      router.refresh();
    } catch (error) {
      toast.error("Xóa bài học không thành công!");
      console.log("error", error);
    }
  };

  const onClickPublish = async () => {
    try {
      const response = lesson.isPublished
        ? await axios.post(
            `/api/courses/${courseId}/lessons/${lesson.id}/unpublish`
          )
        : await axios.post(
            `/api/courses/${courseId}/lessons/${lesson.id}/publish`
          );
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      toast.error("Publish bài học không thành công!");
      console.log("error", error);
    }
  };
  return (
    <>
      <div className="flex flex-col gap-2 mb-7 sm:flex-row sm:justify-between">
        <Link href={`/instructor/courses/${courseId}/lessons`}>
          <Button type="button">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
          </Button>
        </Link>
        <div className="flex gap-5 items-start">
          <PublishButton
            disabled={!isCompleted}
            isPublished={lesson.isPublished}
            onClickPublish={onClickPublish}
          />
          <AlertDialogDelete item="Bài học" onDelete={onDelete} />
        </div>
      </div>

      <h1 className="text-2xl font-bold uppercase text-center">
        Thông tin chi tiết bài học
      </h1>
      <p className="text-sm font-medium mt-2 py-3 text-center">
        Vui lòng cung cấp đầy đủ thông tin về bài học bao gồm video hướng dẫn,
        tài liệu học tập...
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="titleLesson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên bài học</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Web development for beginers"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả bài học</FormLabel>
                <FormControl>
                  <TextEditor placeholder="Mô tả bài học..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {lesson.videoLessonUrl && (
            <div className="my-5">
              <MuxPlayer
                streamType="on-demand"
                playbackId={lesson.muxData?.playbackId || ""}
                accentColor="#ac39f2"
                className="md:max-w-[600px] mx-auto"
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="videoLessonUrl"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Video bài học</FormLabel>
                <FormControl>
                  <UploadFile
                    endpoint="videoLessonUrl"
                    value={field.value || ""}
                    page="Upload Resource"
                    onChange={(url) => field.onChange(url)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Quyền truy cập</FormLabel>
                  <FormDescription>
                    Mọi người có thể xem bài học này{" "}
                    <span className="uppercase font-bold">miễn phí</span>
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-5">
            <Link href={`/instructor/courses/${courseId}/lessons`}>
              <Button type="button" variant="outline">
                Hủy bỏ
              </Button>
            </Link>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Lưu thông tin"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <ResourceForm courseId={courseId} lesson={lesson} />
    </>
  );
};

export default EditLessonForm;
