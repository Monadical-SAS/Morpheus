import { useRouter } from "next/router";

import Brand from "@/components/atoms/Brand/Brand";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const currentPath = router.pathname;

  const redirectToHome = async () => {
    await router.push("/");
  };

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.brand}>
        <Brand onClick={redirectToHome} styles={{ fontSize: "20px" }} />
      </div>

      <div className={"flex flex-row gap-5"}>
        <span>{user.email}</span>
        <span onClick={logout} className={"cursor-pointer"}>
          Logout
        </span>
      </div>
    </div>
  );
};

export default Navbar;
