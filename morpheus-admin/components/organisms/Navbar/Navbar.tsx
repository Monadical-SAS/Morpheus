import { useRouter } from "next/router";
import Link from "next/link";

import Brand from "@/components/atoms/Brand/Brand";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const redirectToHome = async () => {
    await router.push("/");
  };
  const getLinkStyles = (path: string) => {
    const current = currentPath.split("/")[1];
    return `base-1 secondary ${current === path && styles.activeLink}`;
  };

  return (
    <div className={styles.navbarContainer}>
      <div className={styles.brand}>
        <Brand onClick={redirectToHome} styles={{ fontSize: "20px" }} />
      </div>
    </div>
  );
};

export default Navbar;
