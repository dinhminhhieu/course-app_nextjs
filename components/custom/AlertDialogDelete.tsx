import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash, TriangleAlert } from "lucide-react";
import { useState } from "react";

interface AlertDialogDeleteProps {
  item: string;
  onDelete: () => Promise<void>;
}

const AlertDialogDelete = ({ item, onDelete }: AlertDialogDeleteProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 py-3 bg-primary rounded-md text-white flex items-center justify-center">
      <AlertDialog>
        <AlertDialogTrigger>
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash className="w-4 h-4" />
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-medium uppercase text-center">
              Bạn chắc chắn muốn xóa?
            </AlertDialogTitle>
            <div className="border border-black/20"></div>
            <div className="flex items-center justify-center">
              <TriangleAlert className="w-24 h-24 text-red-500" />
            </div>
            <AlertDialogDescription>
              Thao tác này sẽ xóa vĩnh viễn tài nguyên của bạn khỏi máy chủ của
              chúng tôi. Vui lòng cân nhắc thật kỹ trước khi thực hiện xóa{" "}
              <span className="uppercase font-bold text-red-500">{item}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AlertDialogDelete;
