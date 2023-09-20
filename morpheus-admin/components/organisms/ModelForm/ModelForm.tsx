"use client";

import { useForm } from "react-hook-form";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { useEffect, useState } from "react";
import MultipleSelect from "@/components/atoms/multiselect";
import { ToggleInput } from "@/components/atoms/toggle";
import { saveNewModel, updateModel } from "@/api/models";
import { getAvailableCategories } from "@/api/model_categories";
import { ModelCategory, Response } from "@/lib/models";

interface ModelFormProps {
  name?: string;
  source?: string;
  title?: string;
  description?: string;
  url_docs?: string;
  categories?: string;
  is_active?: boolean;
}

interface Option {
  name: string;
}

type MultiValue<Option> = readonly Option[];

interface ArrayObjectSelectState {
  selectedOptions: MultiValue<Option> | null;
  error: string | null;
}

export function ModelForm(props: ModelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModelFormProps>();

  const [categories, setCategories] = useState<ModelCategory[]>([]);
  const [MultipleSelectState, setMultipleSelectState] = useState<ArrayObjectSelectState>({
    selectedOptions: null,
    error: null,
  });

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
        categories: [categories.find((category) => category.name === data.category)],
      };
      const response = await saveNewModel(modelData);
      if (response?.success) {
        alert("Model created successfully");
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleUpdateModel = async (data: any) => {
    const modelData = {
      ...data,
      categories: [categories.find((category) => category.name === data.category)],
    };
    updateModel(modelData)
      .then((response: Response) => {
        if (!response.success) {
          alert(response.message);
        }
      })
      .catch((error) => {
        alert(error);
      });

    alert("Model updated successfully");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <h1 className="text-2xl">{props?.title}</h1>

      <TextInput
        name={"name"}
        label={"Name"}
        value={props?.name}
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
        value={props?.source}
        placeholder={"Hugging Face Source"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 2,
          maxLength: 512,
        }}
        errors={errors.source}
      />

      <MultipleSelect
        name="categories"
        label="Model Categories"
        options={categories}
        state={MultipleSelectState}
        setState={setMultipleSelectState}
      />

      <TextInput
        name={"description"}
        label={"Description"}
        value={props?.description}
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
        value={props?.url_docs}
        placeholder={"Public Model Docs"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 5,
          maxLength: 512,
        }}
        errors={errors.url_docs}
      />

      <TextInput
        name={"kind"}
        label={"Kind"}
        value={props?.url_docs}
        placeholder={"Kind of model"}
        register={register}
        validationSchema={{
          required: true,
          minLength: 5,
          maxLength: 512,
        }}
        errors={errors.url_docs}
      />

      <ToggleInput name={"is_active"} label={"Activate model"} register={register} />

      <Button text={"Submit"} variant={ButtonVariant.Primary} className={"w-full"} />
    </form>
  );
}
