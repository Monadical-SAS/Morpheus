import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { slide as BurgerMenu } from "react-burger-menu";

import Brand from "../Typography/Brand/Brand";
import UserCard, { UserImage } from "../UserCard/UserCard";
import { AuthOption, useAuth } from "@/context/AuthContext";
import { isEmptyObject } from "@/utils/object";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { User } from "@/models/models";

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
  const [showUserCard, setShowUserCard] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowUserCard(true);
    }
  }, [isMobile]);

  const getLinkStyles = (path: string) => {
    const current = currentPath.split("/")[1];
    const active = current === path;
    return `base-1 secondary h-full px-3 mx-[6px] flex items-center cursor-pointer transition-all duration-200 hover:text-white max-md:w-full max-md:px-6 max-md:py-3 max-md:justify-start${active ? " text-white border-b-2 border-[#B3005E]" : ""}`;
  };

  return (
    <Fragment>
      {props.showBrand && (
        <div className="flex-1 h-full flex justify-start items-center max-md:w-full max-md:mt-6 max-md:pl-6">
          <Brand onClick={props.redirectToHome} styles={{ fontSize: "20px" }} />
        </div>
      )}

      <div className="h-full flex justify-center items-center max-md:w-full max-md:flex-col max-md:justify-start max-md:items-start max-md:mt-6">
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

      <nav className="flex-1 flex justify-end max-md:w-full max-md:justify-start max-md:items-start">
        <span
          onClick={() => setShowUserCard(true)}
        >
          <UserImage />
        </span>

        <div className="max-md:w-full max-md:h-auto">
          <UserCard
            showCard={showUserCard}
            setShowCard={setShowUserCard}
            isMobile={isMobile}
          />
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
    <div className="h-[80px] min-h-[80px] max-h-[80px] min-w-[300px] w-full px-8 flex flex-row items-center justify-between flex-auto bg-[#14172D] shadow-[inset_0px_-1px_0px_#312E47] z-20 max-md:h-16 max-md:min-h-[64px] max-md:max-h-16 max-md:p-0 max-md:justify-start max-md:items-start max-md:absolute">
      {isMobile ? (
        <Fragment>
          <BurgerMenu
            isOpen={showMobileMenu}
            onStateChange={(state) => setShowMobileMenu(state.isOpen)}
          >
            <div className="!flex flex-col-reverse">
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
