"use client";

import { useForm } from "react-hook-form";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { Response } from "@/lib/models";
import { useToastContext } from "@/context/ToastContext";
import { createNewAdmin } from "@/api/users";

interface AdminFormModel {
  email: string;
  name: string;
  password: string;
}

const defaultValues: AdminFormModel = {
  email: "",
  name: "",
  password: "",
};

interface AdminFormProps {
  handleRefresh: () => void;
}

export function AdminForm(props: AdminFormProps) {
  const { showErrorAlert, showSuccessAlert } = useToastContext();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormModel>({ defaultValues });

  const handleSaveAdmin = async (data: any) => {
    try {
      const response: Response = (await createNewAdmin(data)) as Response;
      if (response?.success) {
        showSuccessAlert("Admin created successfully.");
        props.handleRefresh();
      } else {
        showErrorAlert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      showErrorAlert("Something went wrong. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSaveAdmin)} className="space-y-2">
      <h1 className="text-2xl">Create a new Admin</h1>

      <TextInput
        name={"name"}
        label={"Name"}
        placeholder={"Admin Name"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 2,
          maxLength: 64,
        }}
        errors={errors.name}
        setValue={setValue}
      />

      <TextInput
        name={"email"}
        label={"Email"}
        placeholder={"Admin Email"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 4,
          maxLength: 64,
        }}
        errors={errors.email}
        setValue={setValue}
      />

      <TextInput
        name={"password"}
        label={"Password"}
        placeholder={"Admin Password"}
        type={"password"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 8,
          maxLength: 64,
        }}
        errors={errors.password}
        setValue={setValue}
      />

      <Button
        text={"Submit"}
        variant={ButtonVariant.Primary}
        className={"w-full"}
        style={{ marginTop: "24px" }}
      />
    </form>
  );
}
