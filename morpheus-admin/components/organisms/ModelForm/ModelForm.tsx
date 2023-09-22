"use client";

import { useForm } from "react-hook-form";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { useEffect, useState } from "react";
import { ToggleInput } from "@/components/atoms/toggle";
import { saveNewModel, updateModel } from "@/api/models";
import { getAvailableCategories } from "@/api/model_categories";
import { ModelCategory, Response } from "@/lib/models";
import { Model } from "@/lib/models";
import MultipleSelect from "@/components/atoms/multipleSelect";
import { KIND_MODELS } from "@/lib/constants";

interface ModelFormProps {
  name?: string;
  source?: string;
  title?: string;
  description?: string;
  url_docs?: string;
  categories?: any[];
  is_active?: boolean;
  kind?: any;
  model?: Model;
  formUpdate?: boolean;
}

export function ModelForm(props: ModelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm<ModelFormProps>({
    defaultValues: {
      name: props?.name,
      source: props?.source,
      description: props?.description,
      url_docs: props?.url_docs,
      categories: props?.categories,
      is_active: props?.is_active,
      kind: [{ name: props?.kind }],
    },
  });

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

  const handleSaveModel = async (data: any) => {
    try {
      const modelData = {
        ...data,
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
      id: props?.model?.id,
    };
    updateModel(modelData)
      .then((response: Response) => {
        if (response.success) {
          alert("Model updated successfully");
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  const onSubmit = props?.formUpdate ? handleUpdateModel : handleSaveModel;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <h1 className="text-2xl">{props?.title}</h1>

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
        setValue={setValue}
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
        setValue={setValue}
      />

      <MultipleSelect
        name="categories"
        label="Model Categories"
        options={categories}
        control={control}
        rules={{ required: true }}
        isMulti={true}
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
        setValue={setValue}
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
        setValue={setValue}
      />

      <MultipleSelect
        name="kind"
        label="Kind of model"
        options={KIND_MODELS}
        control={control}
        rules={{ required: true }}
        isMulti={false}
      />

      <ToggleInput name={"is_active"} label={"Activate model"} register={register} />

      <Button text={"Submit"} variant={ButtonVariant.Primary} className={"w-full"} />
    </form>
  );
}
