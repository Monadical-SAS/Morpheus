import React, { Fragment, useState } from "react";
import Modal from "../Modal/Modal";
import UserProfile from "../UserProfile/UserProfile";
import { LogoutIcon } from "../icons/logout";
import { UserIcon } from "../icons/user";
import { useAuth } from "@/context/AuthContext";
import { useImagine } from "@/context/ImagineContext";
import { isEmptyObject } from "@/utils/object";

export const UserImage = (props: { size?: string }) => {
  const { user } = useAuth();

  const getImageStyles = () => {
    return {
      width: props.size,
      minWidth: props.size,
      maxWidth: props.size,
      height: props.size,
      minHeight: props.size,
      maxHeight: props.size,
    };
  };

  return (
    <div className="w-10 min-w-[40px] max-w-[40px] h-10 min-h-[40px] max-h-[40px] cursor-pointer rounded-full flex justify-center items-center" style={getImageStyles()}>
      <img
        src={user.avatar || "/images/avatar.png"}
        alt="avatar"
        style={getImageStyles()}
        loading="lazy"
        className="w-full h-full rounded-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.png"; }}
      />
    </div>
  );
};

interface UserCardProps {
  showCard: boolean;
  setShowCard: (show: boolean) => void;
  isMobile?: boolean;
}

const UserCard = (props: UserCardProps) => {
  const { user, logout } = useAuth();
  const { clearResults } = useImagine();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleLogout = () => {
    clearResults();
    logout().then(() => {
      window.location.href = "/";
    });
  };

  if (isEmptyObject(user)) return null;

  return (
    <Fragment>
      {props.showCard && (
        <div
          className="z-50 w-screen h-screen absolute top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.2)] flex justify-end items-start max-md:z-auto max-md:relative max-md:w-full max-md:h-auto max-md:block"
          onClick={() => !props.isMobile && props.setShowCard(false)}
        >
          <div className="w-[228px] min-w-[228px] max-w-[300px] flex flex-col bg-[#252238] rounded-b-lg max-md:w-full max-md:min-w-full max-md:max-w-full max-md:h-auto max-md:rounded-none max-md:bg-[#14172D]">
            <div className="flex flex-col w-full h-36 relative">
              <img className="w-full h-full backdrop-blur-[4.5px] object-cover" src={user.avatar || "/images/avatar.png"} alt="" onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.png"; }} />

              <div className="absolute top-0 left-0 w-full h-full p-5 bg-[rgba(20,23,45,0.68)]">
                <UserImage />
                <p className="base-1 white">{user.name}</p>
                <p className="body-3 secondary ellipsis">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-col pt-6 max-md:pt-4">
              <div
                className="mb-4 w-full h-12 px-4 py-2 flex flex-row items-center gap-2 cursor-pointer hover:bg-[#312E47] hover:text-[#B3005E] max-md:mb-0"
                onClick={() => setShowEditModal(true)}
              >
                <span className="w-8 h-8 rounded-full bg-[#312E47] flex justify-center items-center">
                  <UserIcon width={"16"} height={"16"} color={"white"} />
                </span>
                <p className="base-2 white">Profile</p>
              </div>

              <div className="w-full h-12 px-4 py-2 flex flex-row items-center gap-2 cursor-pointer rounded-b-lg border-t border-[#3d3a55] hover:bg-[#312E47] hover:text-[#B3005E] max-md:rounded-none max-md:border-t-0" onClick={handleLogout}>
                <span className="w-8 h-8 rounded-full bg-[#312E47] flex justify-center items-center">
                  <LogoutIcon width={"16"} height={"16"} color={"#B3005E"} />
                </span>
                <p className="base-2 main">Log out</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        showHeader={true}
        headerContent={<h2 className="headline-4 white">Edit Profile</h2>}
        width={"auto"}
        height={"auto"}
        isOpen={showEditModal}
        toggleModal={() => setShowEditModal(!showEditModal)}
      >
        <UserProfile />
      </Modal>
    </Fragment>
  );
};

export default UserCard;
