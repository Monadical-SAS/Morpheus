import { NextPage } from "next";
import PrivateRoute from "../../components/Auth/PrivateRoute/PrivateRoute";
import FAQ from "../../components/FAQ/FAQ";
import styles from "../../styles/pages/Help.module.scss";

const Help: NextPage = () => {
  return (
    <PrivateRoute showLeftBar={true}>
      <div className={styles.mainContent}>
        <FAQ />
      </div>
    </PrivateRoute>
  );
};

export default Help;
