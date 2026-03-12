import { useRouter } from "next/router";

import Brand from "@/components/atoms/Brand/Brand";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const { admin, logout } = useAuth();

  const redirectToHome = async () => {
    await router.push("/models");
  };

  return (
    <div className="h-[80px] min-h-[80px] max-h-[80px] w-full px-8 flex flex-row items-center justify-between flex-auto bg-[#14172D] shadow-[inset_0px_-1px_0px_#f1f1f1] max-md:h-[60px] max-md:min-h-[60px] max-md:max-h-[60px] max-md:justify-start max-md:items-start max-md:p-0">
      <div className="flex-1 h-full flex justify-start items-center max-md:w-full max-md:mt-6 max-md:pl-6">
        <Brand onClick={redirectToHome} styles={{ fontSize: "20px" }} />
      </div>

      <div className="flex-1 h-full flex justify-center items-center max-md:w-full max-md:flex-col max-md:justify-start max-md:items-start max-md:mt-6">
        <Link href={"/models"}>Models</Link>
        <Link href={"/admins"}>Admins</Link>
      </div>

      <div className="flex-1 flex justify-end gap-6 max-md:w-full max-md:justify-start max-md:items-start">
        <span>{admin.email}</span>
        <span onClick={logout} className={"cursor-pointer"}>
          Logout
        </span>
      </div>
    </div>
  );
};

export default Navbar;
