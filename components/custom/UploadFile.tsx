import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import toast from "react-hot-toast";

interface UploadFileProps {
  endpoint: keyof typeof ourFileRouter;
  value: string;
  onChange: (url?: string) => void;
}

const UploadFile = ({ endpoint, value, onChange }: UploadFileProps) => {
  return (
    <div className="flex flex-col flex-wrap gap-3 lg:flex-row">
      {value !== "" && (
        <Image
          src={value}
          width={500}
          height={500}
          className="w-[300px] h-[270px] object-cover rounded-md mt-2"
          alt="thumbnail khóa học"
        />
      )}
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          // Do something with the response
          onChange(res?.[0]?.url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          toast.error(error.message);
        }}
        className="w-[300px] h-[270px]"
      />
    </div>
  );
};

export default UploadFile;
