import { useRouter } from "next/router";
import Link from "next/link";

import Brand from "@/components/Brand/Brand";
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

      <div className={styles.links}>
        <Link className={getLinkStyles("models")} href={"/models"}>
          SD Models
        </Link>
        <Link className={getLinkStyles("controlnet")} href={"/controlnet"}>
          ControlNet
        </Link>
        <Link className={getLinkStyles("lora")} href={"/lora"}>
          LoRa
        </Link>
        <Link className={getLinkStyles("embeddings")} href={"/embeddings"}>
          Embeddings
        </Link>
      </div>

      <nav className={styles.auth}>
        <span className="base-1 secondary">user</span>
      </nav>
    </div>
  );
};

export default Navbar;
