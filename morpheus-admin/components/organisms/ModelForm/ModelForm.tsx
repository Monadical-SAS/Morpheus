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
  title?: string;
  editingModel?: Model;
  models?: Model[];
  setModels?: any;
  formUpdate?: boolean;
  handleModalClose?: any;
}

interface extraParams {
  name: string;
  value: string;
}

type ExtraParam = { [key: string]: any };

const extraParamsToJson = (extraParams: ExtraParam[]) => {
  if (!extraParams) return null;
  const extraParamsJson: ExtraParam = {};
  extraParams.forEach((extraParam: ExtraParam) => {
    extraParamsJson[extraParam.name] = extraParam.value;
  });
  return extraParamsJson;
};

const extraParamsToArray = (extraParams: ExtraParam) => {
  if (!extraParams) return [];
  const extraParamsArray: extraParams[] = [];
  Object.keys(extraParams).forEach((key: string) => {
    extraParamsArray.push({ name: key, value: extraParams[key] });
  });
  return extraParamsArray;
};

export function ModelForm(props: ModelFormProps) {
  const [extraParams, setExtraParams] = useState<extraParams[]>([{ name: "", value: "" }]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    getValues,
  } = useForm<Model>({
    defaultValues: {
      name: props?.editingModel?.name,
      source: props?.editingModel?.source,
      description: props?.editingModel?.description,
      url_docs: props?.editingModel?.url_docs,
      categories: props?.editingModel?.categories,
      is_active: props?.editingModel?.is_active,
      extra_params: extraParamsToArray(props?.editingModel?.extra_params),
      kind: [{ name: props?.editingModel?.kind }],
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
    const extraParams = getValues("extra_params");
    setExtraParams(extraParams);
  }, []);

  const handleSaveModel = async (data: any) => {
    try {
      const modelData = {
        ...data,
        kind: data.kind.name,
      };
      const response = (await saveNewModel(modelData)) as Response;
      if (!response?.success) {
        alert(response?.message);
      }
      const updatedModels = [...(props?.models as Model[]), response?.data?.model_created as Model];
      props?.setModels(updatedModels);
      props?.handleModalClose();
    } catch (error) {
      alert(error);
    }
  };

  const handleUpdateModel = async (data: any) => {
    const modelData = {
      ...data,
      id: props?.editingModel?.id,
      kind: data.kind.name,
      extra_params: extraParamsToJson(data.extra_params),
    };
    console.log(modelData);
    updateModel(modelData)
      .then((response: Response) => {
        if (!response.success) {
          alert(response.message);
        }
        const updatedModels = props?.models?.map((modelData: Model) => {
          if (modelData.source === response.data.model_updated.source) {
            return response.data.model_updated;
          }
          return modelData;
        });

        props?.setModels(updatedModels);
        props?.handleModalClose();
      })

      .catch((error) => {
        alert(error);
      });
  };

  const onSubmit = props?.formUpdate ? handleUpdateModel : handleSaveModel;

  const handleAddFields = () => {
    setExtraParams([...extraParams, { name: "", value: "" }]);
  };

  const handleRemoveFields = (field: extraParams) => {
    console.log(field);
    let values = [...extraParams];
    values = values.filter((value) => value !== field);
    setExtraParams(values);
    let extraParams2 = getValues("extra_params");
    extraParams2 = extraParams2.filter((value: extraParams) => value !== field);
    setValue("extra_params", extraParams2);
  };

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
      <div className="label-text">Extra params</div>
      {extraParams.map((field, index) => (
        <div key={`${field}-${index}`} className="flex flex-row items-center justify-center space-x-2">
          <button
            type="button"
            onClick={() => handleAddFields()}
            className="block w-5 h-5 text-gray-900 bg-gray-100 rounded-md cursor-pointer"
          >
            +
          </button>
          <div className="flex flex-row justify-center space-x-2">
            <TextInput
              name={`extra_params[${index}].name`}
              placeholder={"Insert key"}
              register={register}
              validationSchema={{
                required: true,
                minLength: 2,
                maxLength: 64,
              }}
              errors={errors[`extra_params[${index}].name` as keyof typeof errors]}
              setValue={setValue}
            />

            <TextInput
              name={`extra_params[${index}].value`}
              placeholder={"Insert value"}
              register={register}
              validationSchema={{
                required: true,
                minLength: 2,
                maxLength: 64,
              }}
              errors={errors[`extra_params[${index}].name` as keyof typeof errors]}
              setValue={setValue}
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleRemoveFields(field);
            }}
            className="block w-5 h-5 text-gray-900 bg-gray-100 rounded-md cursor-pointer"
          >
            -
          </button>
        </div>
      ))}

      <ToggleInput name={"is_active"} label={"Activate model"} register={register} />

      <Button text={"Submit"} variant={ButtonVariant.Primary} className={"w-full"} />
    </form>
  );
}
