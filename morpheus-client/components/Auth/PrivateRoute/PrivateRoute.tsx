import { Fragment, ReactNode } from "react";
import FullScreenLoader from "../../Loaders/FullScreenLoader/Loader";
import { Auth } from "../Auth";
import { useAuth } from "@/context/AuthContext";
import { isEmptyObject } from "@/utils/object";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
  const { authLoading, user } = useAuth();

  if (authLoading) return <FullScreenLoader isLoading={authLoading} />;

  if (isEmptyObject(user)) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-[#14172D]">
        <Auth />
      </div>
    );
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
};

export default PrivateRoute;
