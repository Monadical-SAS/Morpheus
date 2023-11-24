"use client";

import { set, useForm } from "react-hook-form";
import { TextInput } from "@/components/atoms/input";
import { Button, ButtonVariant } from "@/components/atoms/button";
import { useEffect, useState, useContext } from "react";
import { ToggleInput } from "@/components/atoms/toggle";
import { saveNewModel, updateModel } from "@/api/models";
import { getAvailableCategories } from "@/api/model_categories";
import { ModelCategory, Response } from "@/lib/models";
import { Model } from "@/lib/models";
import MultipleSelect from "@/components/atoms/multipleSelect";
import { KIND_MODELS, CONTROLNET } from "@/lib/constants";
import { useToastContext } from "@/context/ToastContext";
import { LoadingContext } from "@/context/LoadingContext";

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
  const { showErrorAlert, showSuccessAlert } = useToastContext();
  const defaultValues = {
    name: props?.editingModel?.name,
    source: props?.editingModel?.source,
    description: props?.editingModel?.description,
    url_docs: props?.editingModel?.url_docs,
    categories: props?.editingModel?.categories,
    is_active: props?.editingModel?.is_active,
    extra_params: extraParamsToArray(props?.editingModel?.extra_params),
    kind: [{ name: props?.editingModel?.kind }],
  };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    getValues,
    watch,
  } = useForm<Model>({ defaultValues });
  const [categories, setCategories] = useState<ModelCategory[]>([]);
  const [extraParamsValidation, setExtraParamsValidation] = useState({
    required: false,
    maxLength: 64,
  });
  const { loading, setLoading } = useContext(LoadingContext);

  const watchKind = watch("kind");
  const watchExtraParams = watch("extra_params");

  useEffect(() => {
    getAvailableCategories()
      .then((response: Response) => {
        if (response.success) setCategories(response.data);
      })
      .catch((error) => {
        showErrorAlert("Something went wrong. Please try again later.");
      });
  }, []);

  useEffect(() => {
    setExtraParams(watchExtraParams);
  }, [watchExtraParams]);

  const handleSaveModel = async (data: any) => {
    if (loading) return;
    setLoading(true);
    try {
      const modelData = {
        ...data,
        kind: data.kind.name,
      };
      const response = (await saveNewModel(modelData)) as Response;
      if (response?.success) {
        const updatedModels = [...(props?.models as Model[]), response?.data?.model_created as Model];
        props?.setModels(updatedModels);
        props?.handleModalClose();
        showSuccessAlert("Model created successfully.");
        setLoading(false);
      } else {
        showErrorAlert("Something went wrong. Please try again later.");
        setLoading(false);
      }
    } catch (error) {
      showErrorAlert("Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdateModel = async (data: any) => {
    if (loading) return;
    setLoading(true);
    const modelData = {
      ...data,
      id: props?.editingModel?.id,
      kind: data.kind.name,
      extra_params: extraParamsToJson(data.extra_params),
    };
    updateModel(modelData)
      .then((response: Response) => {
        if (response.success) {
          const updatedModels = props?.models?.map((modelData: Model) => {
            if (modelData.source === response.data.model_updated.source) {
              return response.data.model_updated;
            }
            return modelData;
          });
          props?.setModels(updatedModels);
          props?.handleModalClose();
          showSuccessAlert("Model updated successfully.");
          setLoading(false);
        } else {
          showErrorAlert("Something went wrong. Please try again later.");
          setLoading(false);
        }
      })
      .catch((error) => {
        showErrorAlert("Something went wrong. Please try again later.");
        setLoading(false);
      });
  };

  const onSubmit = props?.formUpdate ? handleUpdateModel : handleSaveModel;

  const handleAddFields = () => {
    setExtraParams([...extraParams, { name: "", value: "" }]);
  };

  const handleRemoveFields = (index: number) => {
    const values = [...getValues("extra_params")];
    if (values.length === 1) return;
    values.splice(index, 1);
    setValue("extra_params", values);
  };

  const getExtraParamsErrors = (index: number) => {
    if (errors.extra_params !== undefined && Array.isArray(errors.extra_params)) {
      return errors.extra_params[index];
    }
    return null;
  };

  useEffect(() => {
    const isControlNet = Array.isArray(watchKind) ? watchKind[0].name === CONTROLNET : watchKind.name === CONTROLNET;
    setExtraParamsValidation({
      required: isControlNet,
      maxLength: 64,
    });
  }, [watchKind]);

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
      <div className="!mt-6 label-text">Extra params {extraParamsValidation.required && "*"}</div>
      {extraParamsValidation.required && (
        <div className="text-xs text-red-500 label-text">
          <strong>Reminder:</strong> Please include the 'type' parameter in 'extra params'. It should be either 'canny',
          'hed', 'depth', 'seg', 'normalmap', 'mlsd', 'scribble' or 'poses'.
        </div>
      )}
      {extraParams.map((field, index) => {
        return (
          <div key={`${field}-${index}`} className="flex flex-row justify-center space-x-2 items-top">
            <Button onClick={() => handleAddFields()} text="+" type="button" />
            <div className="flex flex-row justify-center space-x-2">
              <TextInput
                name={`extra_params[${index}].name`}
                placeholder={"Insert key"}
                register={register}
                validationSchema={extraParamsValidation}
                setValue={setValue}
                errors={getExtraParamsErrors(index)?.name}
              />
              <TextInput
                name={`extra_params[${index}].value`}
                placeholder={"Insert value"}
                register={register}
                validationSchema={extraParamsValidation}
                setValue={setValue}
                errors={getExtraParamsErrors(index)?.value}
              />
            </div>
            <Button onClick={() => handleRemoveFields(index)} type="button" text="-" />
          </div>
        );
      })}

      <ToggleInput name={"is_active"} label={"Activate model"} register={register} />

      <Button
        text={"Submit"}
        variant={ButtonVariant.Primary}
        className={"w-full"}
        loading={loading}
        disabled={loading}
      />
      {loading && <div className="flex justify-center w-full mt-2 text-sm">This may take a few minutes...</div>}
    </form>
  );
}
