import { NextPage } from "next";
import UnderConstruction from "../../components/UnderConstruction/UnderConstruction";
import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import styles from "../../styles/pages/Training.module.scss";

const Training: NextPage = () => {
  return (
    <PrivateRoute showLeftBar={true}>
      <div className={styles.mainContent}>
        <UnderConstruction title={"Training Models"} variant={"small"} />
      </div>
    </PrivateRoute>
  );
};

export default Training;
