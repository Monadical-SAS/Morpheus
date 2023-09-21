import { Fragment, useCallback, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { slide as BurgerMenu } from "react-burger-menu";

import Brand from "../Typography/Brand/Brand";
import UserCard, { UserImage } from "../UserCard/UserCard";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { isEmptyObject } from "@/utils/object";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { User } from "@/models/models";
import styles from "./Navbar.module.scss";

type NavMenuProps = {
  user: User;
  redirectToHome: () => void;
  redirectToProfile: () => void;
  handleAuthActionClick: (authOption: AuthOption) => Promise<void>;
  isMobile?: boolean;
  closeMenu?: () => void;
  showBrand?: boolean;
};

const NavMenu = (props: NavMenuProps) => {
  const router = useRouter();
  const currentPath = router.pathname;
  const { isMobile } = useWindowDimensions();
  const [showUserCard, setShowUserCard] = useState(isMobile || false);

  const getLinkStyles = (path: string) => {
    const current = currentPath.split("/")[1];
    return `base-1 secondary ${current === path && styles.activeLink}`;
  };

  return (
    <Fragment>
      {props.showBrand && (
        <div className={styles.brand}>
          <Brand onClick={props.redirectToHome} styles={{ fontSize: "20px" }} />
        </div>
      )}

      <div className={styles.links}>
        <Link className={getLinkStyles("imagine")} href={"/imagine/text2img"}>
          Imagine
        </Link>
        <Link className={getLinkStyles("gallery")} href={"/gallery"}>
          Gallery
        </Link>
        <Link className={getLinkStyles("about")} href={"/about"}>
          About
        </Link>
      </div>

      <nav className={styles.auth}>
        <span
          className={styles.avatarImage}
          onClick={() => setShowUserCard(true)}
        >
          <UserImage />
        </span>

        <div className={styles.userCardContainer}>
          <UserCard showCard={showUserCard} setShowCard={setShowUserCard} />
        </div>
      </nav>
    </Fragment>
  );
};

interface NavbarProps {
  showBrand?: boolean;
}

const Navbar = (props: NavbarProps) => {
  const router = useRouter();
  const { user, setAuthOption } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isMobile } = useWindowDimensions();

  const redirectToHome = useCallback(async () => {
    if (isEmptyObject(user)) {
      router.push("/");
    } else if (!router.asPath.startsWith("/imagine")) {
      router.push("/imagine/text2img");
    }
  }, [user, router]);

  const redirectToProfile = useCallback(async () => {
    router.push("/profile");
  }, [router]);

  const handleAuthActionClick = useCallback(
    async (authOption: AuthOption) => {
      if (router.pathname !== "") {
        router.push("/");
        setAuthOption(authOption);
      }
      setAuthOption(authOption);
    },
    [router, setAuthOption]
  );

  return (
    <div className={styles.navbarContainer}>
      {isMobile ? (
        <Fragment>
          <BurgerMenu
            isOpen={showMobileMenu}
            onStateChange={(state) => setShowMobileMenu(state.isOpen)}
          >
            <div className={styles.burgerMenuContent}>
              <NavMenu
                user={user}
                redirectToHome={redirectToHome}
                redirectToProfile={redirectToProfile}
                handleAuthActionClick={handleAuthActionClick}
                isMobile={true}
                closeMenu={() => setShowMobileMenu(false)}
              />
            </div>
          </BurgerMenu>
          <Brand
            styles={{
              width: "100%",
              display: "flex",
              alignSelf: "center",
              justifyContent: "center",
            }}
          />
        </Fragment>
      ) : (
        <NavMenu
          user={user}
          redirectToHome={redirectToHome}
          redirectToProfile={redirectToProfile}
          handleAuthActionClick={handleAuthActionClick}
          isMobile={false}
          showBrand={props.showBrand}
        />
      )}
    </div>
  );
};

export default Navbar;
