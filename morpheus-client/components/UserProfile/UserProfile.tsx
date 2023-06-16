import EditProfileForm from "../EditProfileForm/EditProfileForm";
import { UserIcon } from "../icons/user";
import { CloseIcon } from "../icons/close";
import { logout, removeUserInfo } from "@/services/users";
import { useAuth } from "@/context/AuthContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useToastContext } from "@/context/ToastContext";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import styles from "./UserProfile.module.scss";

export const UserProfile = () => {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { showSuccessAlert, showWarningAlert, showErrorAlert } =
    useToastContext();
  const isMobile = width <= MOBILE_SCREEN_WIDTH;

  const confirmRemove = () => {
    showWarningAlert(
      "Are you sure you want to delete your account?",
      "Confirm",
      handleRemove
    );
  };

  const handleRemove = () => {
    removeUserInfo(user.email)
      .then((response: any) => {
        if (response) {
          showSuccessAlert("User removed");
          logout().then(() => {
            window.location.href = "/";
          });
        }
      })
      .catch((error: any) => {
        showErrorAlert(error.message || "Error removing user");
      });
  };

  const DeleteAccount = (
    <div className={styles.navItem} onClick={confirmRemove}>
      <CloseIcon width={"16"} height={"16"} color={"#B3005E"} />
      <p className="base-2 main">Delete account</p>
    </div>
  );

  return (
    <div className={styles.userProfileContainer}>
      <div className={styles.userProfileNav}>
        <div className={`${styles.navItem} ${styles.active}`}>
          <UserIcon width={"16"} height={"16"} color={"white"} />
          <p className="base-2 white">Edit profile</p>
        </div>

        {!isMobile && DeleteAccount}
      </div>

      <div className={styles.userProfileContent}>
        <EditProfileForm />
      </div>

      {isMobile && (
        <div className={styles.mobileDeleteAccount}>{DeleteAccount}</div>
      )}
    </div>
  );
};

export default UserProfile;
