"use client";

import { FormatCurrency, FormatDate } from "@/lib/format";
import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên khóa học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Giá tiền
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return FormatCurrency(price);
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trạng thái
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return isPublished ? (
        <Badge>Publish</Badge>
      ) : (
        <Badge variant="outline">Unpublish</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | Date;
      // Kiểm tra nếu createdAt là một chuỗi, chuyển đổi nó thành đối tượng Date
      const date =
        typeof createdAt === "string" ? new Date(createdAt) : createdAt;
      return FormatDate(date);
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Ngày cập nhật",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as string | Date;
      // Kiểm tra nếu updatedAt là một chuỗi, chuyển đổi nó thành đối tượng Date
      const date =
        typeof updatedAt === "string" ? new Date(updatedAt) : updatedAt;
      return FormatDate(date);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        href={`/instructor/courses/${row.original.id}/basic-info`}
        className="flex gap-2 items-center"
      >
        <Pencil className="w-4 h-4" />
        Xem
      </Link>
    ),
  },
];
