"use client";

import { useForm, Controller } from "react-hook-form";
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
  categories?: any[];
  is_active?: boolean;
}

export function ModelForm(props: ModelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
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
    console.log(data);
    try {
      const modelData = {
        ...data,
        categories: data.categories.selectedOptions
      };
      console.log(modelData);
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
      categories: data.categories.selectedValues
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

      <Controller
        name="categories"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MultipleSelect
            label="Model Categories"
            options={categories}
            value={field.value}
            onChange={(newValue) => {field.onChange(newValue); setValue('categories', newValue)}}
            errors={errors.categories}
          />
        )}
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
