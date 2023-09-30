import { Fragment, ReactNode } from "react";
import FullScreenLoader from "@/components/molecules/FullScreenLoader/FullScreenLoader";
import { useAuth } from "@/context/AuthContext";
import { Auth } from "@/components/organisms/Auth/Auth";
import { isEmptyObject } from "@/lib/utils";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
  const { authLoading, admin } = useAuth();

  if (authLoading) return <FullScreenLoader isLoading={authLoading} />;

  if (isEmptyObject(admin)) {
    return <Auth />;
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
};

export default PrivateRoute;
