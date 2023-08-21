import { Fragment, ReactNode } from "react";
import FullScreenLoader from "../../Loaders/FullScreenLoader/Loader";
import { Auth } from "../Auth";
import { useAuth } from "@/context/AuthContext";
import { isEmptyObject } from "@/utils/object";
import styles from "./PrivateRoute.module.scss";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
  const { authLoading, user } = useAuth();

  if (authLoading) return <FullScreenLoader isLoading={authLoading} />;

  if (isEmptyObject(user)) {
    return (
      <div className={styles.authWrapper}>
        <Auth />
      </div>
    );
  } else {
    return <Fragment>{props.children}</Fragment>;
  }
};

export default PrivateRoute;
