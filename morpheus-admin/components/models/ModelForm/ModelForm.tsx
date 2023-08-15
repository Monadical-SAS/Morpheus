"use client";

import { useForm } from "react-hook-form";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { useEffect, useState } from "react";
import { Select } from "@/components/atoms/select";
import { ToggleInput } from "@/components/atoms/toggle";
import { saveNewModel } from "@/api/models";
import { getAvailableCategories } from "@/api/model_categories";
import { ModelCategory, Response } from "@/lib/models";

interface ModelFormProps {
  name: string;
  source: string;
  description?: string;
  url_docs?: string;
  category?: string;
  is_active?: boolean;
}

export function ModelForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModelFormProps>();

  const [categories, setCategories] = useState<ModelCategory[]>([]);

  useEffect(() => {
    getAvailableCategories()
      .then((response: Response) => {
        if (response.success) setCategories(response.data);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const modelData = {
        ...data,
        categories: [
          categories.find((category) => category.name === data.category),
        ],
      };
      const response = await saveNewModel(modelData);
      if (response.success) {
        alert("Model created successfully");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <h1 className="text-2xl">Add a new Model</h1>

      <TextInput
        name={"name"}
        label={"Name"}
        placeholder={"Public Model Name"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 2,
          maxLength: 64,
        }}
        errors={errors.name}
      />

      <TextInput
        name={"source"}
        label={"Source"}
        placeholder={"Hugging Face Source"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 2,
          maxLength: 512,
        }}
        errors={errors.source}
      />

      <TextInput
        name={"description"}
        label={"Description"}
        placeholder={"Public Model description"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 5,
          maxLength: 512,
        }}
        errors={errors.description}
      />

      <TextInput
        name={"url_docs"}
        label={"URL Docs"}
        placeholder={"Public Model Docs"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 5,
          maxLength: 512,
        }}
        errors={errors.url_docs}
      />

      <Select
        name={"category"}
        label={"Model Category"}
        options={categories.map((category) => category.name)}
        register={register}
        validationSchema={{
          required: true,
        }}
        errors={errors.category}
      />

      <ToggleInput
        name={"is_active"}
        label={"Activate model"}
        register={register}
      />

      <Button
        text={"Submit"}
        variant={ButtonVariant.Primary}
        className={"w-full"}
        type={"submit"}
      />
    </form>
  );
}
