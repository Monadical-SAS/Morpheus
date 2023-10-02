import { useRouter } from "next/router";

import Brand from "@/components/atoms/Brand/Brand";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.scss";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const { admin, logout } = useAuth();

  const redirectToHome = async () => {
    await router.push("/");
  };

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.brand}>
        <Brand onClick={redirectToHome} styles={{ fontSize: "20px" }} />
      </div>

      <div className={styles.links}>
        <Link href={"/models"}>Models</Link>
        <Link href={"/admins"}>Admins</Link>
      </div>

      <div className={styles.auth}>
        <span>{admin.email}</span>
        <span onClick={logout} className={"cursor-pointer"}>
          Logout
        </span>
      </div>
    </div>
  );
};

export default Navbar;
