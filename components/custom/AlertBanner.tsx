import { Rocket, Terminal, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertBannerProps {
  isCompleted: Boolean;
  missingFieldsCount: number;
  requiredFieldsCount: number;
}

const AlertBanner = ({
  isCompleted,
  missingFieldsCount,
  requiredFieldsCount,
}: AlertBannerProps) => {
  return (
    <Alert
      className="my-4"
      variant={`${isCompleted ? "completed" : "destructive"}`}
    >
      <div className="flex gap-3">
        <div className="flex justify-center items-center">
          {isCompleted ? (
            <Rocket className="h-6 w-6" />
          ) : (
            <TriangleAlert className="h-6 w-6" />
          )}
        </div>
        <div>
          <AlertTitle className="text-xs font-medium flex gap-2">
          <Terminal className="h-4 w-4" />
            {missingFieldsCount}{" "}
            <span>
              trường chưa hoàn thành / {requiredFieldsCount} trường bắt buộc
            </span>
          </AlertTitle>
          <AlertDescription className="text-xs">
            {isCompleted
              ? "Đã hoàn tất thông tin. Có thể Publish khóa học"
              : "Vui lòng hoàn tất thông tin trước khi Publish khóa học"}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default AlertBanner;
