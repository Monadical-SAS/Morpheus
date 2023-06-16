import { ReactNode } from "react";
import MainContainer from "../../../layout/MainContainer/MainContainer";
import FullScreenLoader from "../../Loaders/FullScreenLoader/Loader";
import { Auth } from "../Auth";
import { useAuth } from "../../../context/AuthContext";
import { isEmptyObject } from "../../../utils/object";
import styles from "./PrivateRoute.module.scss";

interface PrivateRouteProps {
  showLeftBar?: boolean;
  children: ReactNode;
}

const PrivateRoute = (props: PrivateRouteProps) => {
  const { authLoading, user } = useAuth();

  if (authLoading) return <FullScreenLoader isLoading={authLoading} />;

  return (
    <MainContainer showLeftBar={props.showLeftBar}>
      {!authLoading && isEmptyObject(user) && (
        <div className={styles.authWrapper}>
          <Auth />
        </div>
      )}
      {!authLoading && !isEmptyObject(user) && (
        <div className={styles.mainContent}>{props.children}</div>
      )}
    </MainContainer>
  );
};

export default PrivateRoute;
