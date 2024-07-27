import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 border-t">{children}</div>
      </div>
    </div>
  );
};

export default InstructorLayout;
