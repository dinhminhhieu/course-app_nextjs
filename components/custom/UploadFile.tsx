import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/lib/uploadthing";
import MuxPlayer from "@mux/mux-player-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface UploadFileProps {
  endpoint: keyof typeof ourFileRouter;
  value: string;
  page: string;
  onChange: (url?: string) => void;
}

const UploadFile = ({ endpoint, value, page, onChange }: UploadFileProps) => {
  return (
    <div
      className={`flex ${
        page === "Edit Course" ? "" : "flex-col"
      } flex-wrap gap-3`}
    >
      <div className="flex flex-col lg:flex-row">
        {page === "Edit Course" && value !== "" && (
          <Image
            src={value}
            width={500}
            height={500}
            className="w-[300px] h-[270px] object-cover rounded-md mt-2"
            alt="thumbnail khóa học"
          />
        )}
      </div>

      {page === "Upload Resource" && value !== "" && (
        <Link href={value} className="text-sm font-bold p-2 text-red-500">
          {value}
        </Link>
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
