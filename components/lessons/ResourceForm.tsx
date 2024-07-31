"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Lesson, Resource } from "@prisma/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
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
import { FileText, Loader2, PlusCircle, X } from "lucide-react";
import UploadFile from "../custom/UploadFile";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tên là bắt buộc và phải có ít nhất 2 ký tự",
  }),
  fileUrl: z.string().min(1, {
    message: "File là bắt buộc",
  }),
});

interface ResourceFormProps {
  courseId: string;
  lesson: Lesson & { resources: Resource[] };
}

const ResourceForm = ({ courseId, lesson }: ResourceFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fileUrl: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `/api/courses/${courseId}/lessons/${lesson.id}/resources`,
        values
      );
      toast.success(response.data.message);
      form.reset();
      router.refresh();
    } catch (error) {
      console.log("Failed to create new upload resource!", error);
      toast.error("Tạo tài nguyên bài học không thành công!");
    }
  };

  const onDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `/api/courses/${courseId}/lessons/${lesson.id}/resources/${id}`
      );
      toast.success(response.data.message);
      router.refresh();
    } catch (error) {
      toast.error("Tạo tài nguyên bài học không thành công!");
    }
  };
  return (
    <>
      <div className="flex gap-2 items-center text-xl font-bold">
        <PlusCircle className="h-6 w-6" />
        <span>Thêm tài nguyên</span>
      </div>
      <p className="text-sm font-medium mt-2 py-3">
        Cung cấp tài nguyên cho bài học để giúp học viên hiểu rõ hơn.
      </p>
      <div className="flex flex-col gap-3 mt-2">
        {lesson.resources.map((resource) => (
          <div
            key={resource.id}
            className="flex justify-between rounded-lg text-sm font-medium bg-primary/50 text-white p-2"
          >
            <div className="flex justify-center items-center">
              <FileText className="h-4 w-4 mr-4" />
              <span>{resource.name}</span>
            </div>
            <Button
              disabled={isSubmitting}
              className="bg-transparent hover:bg-primary/20 cursor-pointer"
              onClick={() => onDelete(resource.id)}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tài nguyên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Thêm tài nguyên cho bài học..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tải lên tài nguyên bài học</FormLabel>
                  <FormControl>
                    <UploadFile
                      endpoint="lessonResource"
                      value={field.value || ""}
                      page="Upload Resource"
                      onChange={(url) => field.onChange(url)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                " Tải lên tài nguyên"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ResourceForm;
