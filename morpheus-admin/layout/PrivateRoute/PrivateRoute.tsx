import { Fragment, ReactNode } from "react";
import FullScreenLoader from "@/components/molecules/FullScreenLoader/FullScreenLoader";
import { useAuth } from "@/context/AuthContext";
import { isEmptyObject } from "@/lib/utils";
import { useRouter } from "next/router";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
  const router = useRouter();
  const { authLoading, admin } = useAuth();

  if (authLoading) return <FullScreenLoader isLoading={authLoading} />;

  if (isEmptyObject(admin)) {
    router.push("/");
  }
  return <Fragment>{props.children}</Fragment>;
};

export default PrivateRoute;
