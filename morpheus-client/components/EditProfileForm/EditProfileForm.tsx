import React, { useEffect, useState } from "react";
import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import InputFile from "../Inputs/InputFile/InputFile";
import { UserImage } from "../UserCard/UserCard";
import { uploadFileToServer } from "@/services/files";
import { isAllTrue } from "@/utils/arrays";
import { useAuth } from "@/context/AuthContext";
import { updateUserInfo } from "@/services/users";
import { useToastContext } from "@/context/ToastContext";
import InputText, {
  initialText,
  TextState,
} from "../Inputs/InputText/InputText";
const EditProfileForm = () => {
  const { user, loadUser } = useAuth();
  const { showSuccessAlert, showErrorAlert } = useToastContext();

  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [name, setName] = useState<TextState>(initialText);
  const [bio, setBio] = useState<TextState>(initialText);

  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (user) {
      setName({ ...name, value: user.name });
      setBio({ ...bio, value: user.bio || "" });
    }
  }, [user]);

  useEffect(() => {
    setFormValid(
      (name.value && isAllTrue(name.validators) && isAllTrue(bio.validators)) ||
        false
    );
  }, [name, bio]);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    const newUser = {
      ...user,
      name: name.value,
      bio: bio.value,
    };

    setLoading(true);
    try {
      if (newAvatar) {
        const response = await uploadFileToServer(newAvatar, "avatars");
        if (response.success) {
          newUser.avatar = response.data;
        } else {
          showErrorAlert("Error uploading the avatar");
        }
      }

      const response = await updateUserInfo(newUser);
      if (response.success) {
        showSuccessAlert("User data updated successfully");
        await loadUser(user.email);
        setLoading(false);
      }
    } catch (error: any) {
      showErrorAlert(error.message || "Error updating user");
      setLoading(false);
    }
  };

  return (
    <form className="w-full flex flex-col">
      <div>
        <span className="base-2 white">Avatar</span>
        <div className="flex mt-[10px] max-md:flex-col max-md:items-center">
          <UserImage size={"108px"} />

          <div className="flex flex-col ml-4 max-md:w-full max-md:ml-0 max-md:mt-4">
            <InputFile file={newAvatar} setFile={setNewAvatar} />
            <p className="caption-1 secondary">
              At least 800x800 px recommended. JPG or PNG is allowed
            </p>
          </div>
        </div>
      </div>

      <InputText
        id="inputTextEditUserName"
        label={"Full name"}
        placeholder={"Username"}
        text={name}
        setText={setName}
        isRequired={true}
        minValueLength={2}
        maxValueLength={50}
        styles={{ marginTop: "24px" }}
      />

      <InputTextArea
        id="inputTextAreaBio"
        label={"Bio"}
        placeholder={"Short bio"}
        text={bio}
        setText={setBio}
        isRequired={false}
        minValueLength={0}
        maxValueLength={256}
        styles={{ marginTop: "24px" }}
      />

      <ButtonPrimary
        styles={{ width: "100%", marginTop: "32px" }}
        loading={loading}
        text={"Save changes"}
        onClick={handleFormSubmit}
        disabled={!formValid}
      />
    </form>
  );
};

export default EditProfileForm;
