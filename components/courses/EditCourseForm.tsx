"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Course } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TextEditor from "../custom/TextEditor";
import ComboBox from "../custom/ComboBox";
import UploadFile from "../custom/UploadFile";
import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Trash } from "lucide-react";
import AlertDialogDelete from "../custom/AlertDialogDelete";
import PublishButton from "../custom/PublishButton";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Tiêu đề là bắt buộc và phải có ít nhất 2 ký tự",
  }),
  subTitle: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: "Danh mục là bắt buộc",
  }),
  subCategoryId: z.string().min(1, {
    message: "Danh mục con là bắt buộc",
  }),
  levelLearnerId: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.coerce.number().optional(),
});

interface EditCourseFormProps {
  course: Course;
  categories: {
    label: string;
    value: string;
    subCategories: { label: string; value: string }[];
  }[];
  levelLearner: { label: string; value: string }[];
  isCompleted: boolean;
}

const EditCourseForm = ({
  course,
  categories,
  levelLearner,
  isCompleted,
}: EditCourseFormProps) => {
  const routes = [
    {
      label: "Thông tin khóa học",
      path: `/instructor/courses/${course.id}/basic-info`,
    },
    {
      label: "Chương trình giảng dạy",
      path: `/instructor/courses/${course.id}/lessons`,
    },
  ];

  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      subTitle: course.subTitle || "",
      description: course.description || "",
      categoryId: course.categoryId,
      subCategoryId: course.subCategoryId,
      levelLearnerId: course.levelLearnerId || "",
      thumbnail: course.thumbnail || "",
      price: course.price || undefined,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.patch(`/api/courses/${course.id}`, values);
      router.push(`/instructor/courses/${response.data.id}/basic-info`);
      toast.success("Cập nhật khóa học thành công!");
    } catch (error) {
      console.log("Failed to update the course!", error);
      toast.error("Cập nhật khóa học không thành công!");
    }
  };

  const onDelete = async () => {
    try {
      const response = await axios.delete(`/api/courses/${course.id}`);
      toast.success(response.data.message);
      router.push("/instructor/courses");
      router.refresh();
    } catch (error) {
      console.log("Failed to delete the course!", error);
      toast.error("Xóa khóa học không thành công!");
    }
  };

  const onClickPublish = async () => {
    try {
      const response = course.isPublished
        ? await axios.post(`/api/courses/${course.id}/unpublish`)
        : await axios.post(`/api/courses/${course.id}/publish`);
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      console.log("Failed to publish the course!", error);
      toast.error("Xuất bản khóa học không thành công!");
    }
  };
  return (
    <>
      <div className="flex flex-col gap-2 mb-7 sm:flex-row sm:justify-between">
        <div className="flex gap-5">
          {routes.map((route) => (
            <Link href={route.path} key={route.path}>
              <Button variant={pathname === route.path ? "default" : "outline"}>
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-start gap-5">
          <PublishButton
            disabled={!isCompleted}
            isPublished={course.isPublished}
            onClickPublish={onClickPublish}
          />
          <AlertDialogDelete item="Khóa học" onDelete={onDelete} />
        </div>
      </div>

      <h1 className="text-2xl font-bold uppercase text-center">
        Thông tin khóa học
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khóa học</FormLabel>
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
            name="subTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tiêu đề phụ <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Nhập tiêu đề phụ của khóa học của bạn..."
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
                <FormLabel>Mô tả khóa học</FormLabel>
                <FormControl>
                  <TextEditor
                    placeholder="Mô tả khóa học của bạn..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-10">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Danh mục khóa học <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboBox options={categories} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subCategoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Danh mục con <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboBox
                      options={
                        categories.find(
                          (category) =>
                            category.value === form.watch("categoryId")
                        )?.subCategories || []
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levelLearnerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Chọn level người học <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboBox options={levelLearner} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Thumnail khóa học <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <UploadFile
                    endpoint="courseThumbnail"
                    value={field.value || ""}
                    page="Edit Course"
                    onChange={(url) => field.onChange(url)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Giá khóa học <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    placeholder="Ex: Nhập giá khóa học..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-5">
            <Link href="/instructor/courses">
              <Button type="button" variant="outline">
                Hủy bỏ
              </Button>
            </Link>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Lưu thông tin"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EditCourseForm;
