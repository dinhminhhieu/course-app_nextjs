"use client";

import { BarChart4, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const sideBarRoute = [
    {
      icon: <BarChart4 />,
      label: "Bảng điều khiển",
      path: "/instructor/dashboard",
    },
    { icon: <MonitorPlay />, label: "Khóa học", path: "/instructor/courses" },
  ];
  const pathname = usePathname();
  return (
    <div className="flex flex-col w-64 border-r-2 shadow-md px-3 my-1 gap-4 text-sm font-medium max-md:hidden">
      {sideBarRoute.map((route, index) => (
        <Link
          href={route.path}
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            pathname.startsWith(route.path)
              ? "bg-gray-800 text-white"
              : "hover:bg-[#1f2937]/50 hover:text-white "
          }`}
        >
          {route.icon} {route.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
