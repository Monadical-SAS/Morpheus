import EditProfileForm from "../EditProfileForm/EditProfileForm";
import { UserIcon } from "../icons/user";
import { CloseIcon } from "../icons/close";
import { logout, removeUserInfo } from "@/services/users";
import { useAuth } from "@/context/AuthContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useToastContext } from "@/context/ToastContext";

export const UserProfile = () => {
  const { user } = useAuth();
  const { showSuccessAlert, showWarningAlert, showErrorAlert } =
    useToastContext();
  const { isMobile } = useWindowDimensions();

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
    <div className="h-12 flex items-center mb-6 cursor-pointer" onClick={confirmRemove}>
      <CloseIcon width={"16"} height={"16"} color={"#B3005E"} />
      <p className="base-2 main ml-3">Delete account</p>
    </div>
  );

  return (
    <div className="w-full flex flex-row gap-8 max-md:flex-col max-md:gap-0">
      <div className="min-w-[144px] mr-8 flex flex-col flex-1 max-md:mr-0 max-md:mb-6 max-md:flex-row max-md:items-center max-md:gap-16">
        <div className="h-12 flex items-center mb-6 cursor-pointer border-b-2 border-[#B3005E]">
          <UserIcon width={"16"} height={"16"} color={"white"} />
          <p className="base-2 white ml-3">Edit profile</p>
        </div>
        {!isMobile && DeleteAccount}
      </div>

      <div className="min-w-[422px] flex flex-col flex-[3] max-md:min-w-full">
        <EditProfileForm />
      </div>
      {isMobile && (
        <div className="w-full mt-12 flex justify-center">{DeleteAccount}</div>
      )}
    </div>
  );
};

export default UserProfile;
