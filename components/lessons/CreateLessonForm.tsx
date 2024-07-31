"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Course, Lesson } from "@prisma/client";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import LessonList from "./LessonList";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  titleLesson: z.string().min(2, {
    message: "Tiêu đề là bắt buộc và phải có ít nhất 2 ký tự",
  }),
});

interface CreateLessonFormProps {
  course: Course & { lessons: Lesson[] };
}

const CreateLessonForm = ({ course }: CreateLessonFormProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = [
    {
      label: "Thông tin cơ bản",
      path: `/instructor/courses/${course.id}/basic-info`,
    },
    {
      label: "Chương trình giảng dạy",
      path: `/instructor/courses/${course.id}/lessons`,
    },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titleLesson: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `/api/courses/${course.id}/lessons`,
        values
      );
      router.push(
        `/instructor/courses/${course.id}/lessons/${response.data.id}`
      );
      toast.success("Tạo bài học thành công!");
    } catch (error) {
      console.log("Failed to create new lesson!", error);
      toast.error("Tạo bài học không thành công!");
    }
  };

  const onReOrder = async (updateData: { id: string; position: number }[]) => {
    try {
      const data = await axios.put(
        `/api/courses/${course.id}/lessons/reorder`,
        {
          lessonlist: updateData,
        }
      );
      console.log(data);
      toast.success("Sắp xếp bài học thành công!");
    } catch (error) {
      console.log("Failed to reorder lessons!", error);
      toast.error("Sắp xếp bài học không thành công!");
    }
  };
  return (
    <>
      <div className="flex gap-5">
        {routes.map((route) => (
          <Link href={route.path} key={route.path}>
            <Button variant={pathname === route.path ? "default" : "outline"}>
              {route.label}
            </Button>
          </Link>
        ))}
      </div>
      <h1 className="text-2xl mt-3 font-bold uppercase text-center">
        Chương trình giảng dạy
      </h1>
      <LessonList
        lessonItems={course.lessons || []}
        onReOrder={onReOrder}
        onEdit={(id) =>
          router.push(`/instructor/courses/${course.id}/lessons/${id}`)
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="titleLesson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề bài học</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Thêm tiêu đề bài học..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-5">
            <Link href={`/instructor/courses/${course.id}/basic-info`}>
              <Button type="button" variant="outline">
                Hủy bỏ
              </Button>
            </Link>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Tạo bài học"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default CreateLessonForm;
