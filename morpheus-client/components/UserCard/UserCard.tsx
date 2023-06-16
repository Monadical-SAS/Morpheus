import React, { Fragment, useState } from "react";
import Modal from "../Modal/Modal";
import UserProfile from "../UserProfile/UserProfile";
import { LogoutIcon } from "../icons/logout";
import { UserIcon } from "../icons/user";
import { useAuth } from "@/context/AuthContext";
import { useImagine } from "@/context/ImagineContext";
import { isEmptyObject } from "@/utils/object";
import styles from "./UserCard.module.scss";

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
    <div className={styles.userImage} style={getImageStyles()}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          style={getImageStyles()}
          loading="lazy"
        />
      ) : (
        <UserIcon width={"24px"} height={"24px"} />
      )}
    </div>
  );
};

interface UserCardProps {
  showCard: boolean;
  setShowCard: (show: boolean) => void;
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
          className={styles.userCardWrapper}
          onClick={() => props.setShowCard(false)}
        >
          <div className={styles.userCardContainer}>
            <div className={styles.userHeader}>
              <img className={styles.imageFilter} src={user.avatar} alt="" />

              <div className={styles.userInfo}>
                <UserImage />
                <p className="base-1 white">{user.name}</p>
                <p className="body-3 secondary ellipsis">{user.email}</p>
              </div>
            </div>

            <div className={styles.actionsContainer}>
              <div
                className={styles.profileItem}
                onClick={() => setShowEditModal(true)}
              >
                <span className={styles.icon}>
                  <UserIcon width={"16"} height={"16"} color={"white"} />
                </span>
                <p className="base-2 white">Profile</p>
              </div>

              <div className={styles.logoutItem} onClick={handleLogout}>
                <span className={styles.icon}>
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
