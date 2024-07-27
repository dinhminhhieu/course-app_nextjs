"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";

const Topbar = () => {
  const topBarRoute = [
    { label: "Giảng Viên", path: "/instructor/courses" },
    { label: "Học Tập", path: "/learning" },
  ];

  const router = useRouter();
  const { isSignedIn } = useAuth();

  const redirectSignInClick = () => {
    router.push("/sign-in");
  };
  return (
    <div className="flex justify-between items-center p-4">
      <Link href="/" className="">
        <Image src="/image.png" alt="logo" width={200} height={100} />
      </Link>

      <div className="w-[400px] rounded-full flex max-md:hidden">
        <input
          type="text"
          placeholder="Tìm khóa học"
          className="w-full p-2 rounded-l-full flex-grow border-y-2 border-l-2 text-sm px-4 py-3 focus:outline-none"
        />
        <button className="bg-gray-800 text-white px-4 py-3 cursor-pointer rounded-r-full border-none outline-none">
          <Search size={20} />
        </button>
      </div>

      <div className="flex gap-6 items-center">
        <ul className="flex gap-6 max-sm:hidden">
          {topBarRoute.map((route, index) => (
            <li key={index} className="ml-4">
              <div className="group text-gray-600 transition duration-300">
                <Link
                  href={route.path}
                  className="text-gray-900 text-sm font-bold hover:text-gray-900/50 uppercase tracking-wider"
                >
                  {route.label}
                  <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-gray-900/50"></span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {isSignedIn ? (
          <UserButton afterSwitchSessionUrl="/sign-in" />
        ) : (
          <Button
            onClick={redirectSignInClick}
            className="text-white text-sm font-medium"
          >
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
