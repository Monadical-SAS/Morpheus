import React, { useEffect, useState } from "react";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import InputFile from "../Inputs/InputFile/InputFile";
import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import { ImageIcon } from "@/components/icons/image";
import { useToastContext } from "@/context/ToastContext";
import { saveCollection, updateCollection } from "@/services/collection";
import { uploadFileToServer } from "@/services/files";
import { isAllTrue } from "@/utils/arrays";
import InputText, {
  initialText,
  TextState,
} from "../Inputs/InputText/InputText";
import { Collection } from "@/models/models";

interface CollectionFormProps {
  collection?: Collection;
  closeForm: () => void;
  reload: () => void;
}

const CollectionForm = (props: CollectionFormProps) => {
  const { showSuccessAlert, showErrorAlert } = useToastContext();

  const [name, setName] = useState<TextState>(initialText);
  const [description, setDescription] = useState<TextState>(initialText);
  const [imageUrl, setImageUrl] = useState<TextState>(initialText);
  const [image, setImage] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    const initValue = (value: string) => {
      return { value, validators: [] };
    };

    if (props.collection) {
      setName(initValue(props.collection.name));
      setDescription(initValue(props.collection.description));
      setImageUrl(initValue(props.collection.image || ""));
    }
  }, [props.collection]);

  useEffect(() => {
    setFormValid(
      (name.value &&
        isAllTrue(name.validators) &&
        isAllTrue(description.validators) &&
        isAllTrue(imageUrl.validators)) ||
        false
    );
  }, [name, description, imageUrl]);

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    if (image) {
      await uploadFile(image);
    } else {
      await saveOrUpdateCollection();
    }
  };

  const uploadFile = async (image: File) => {
    setIsLoading(true);
    uploadFileToServer(image, "collections")
      .then(async (response) => {
        if (response && response.success) {
          setIsLoading(false);
          await saveOrUpdateCollection(response.data);
        }
      })
      .catch(() => {
        setIsLoading(false);
        showErrorAlert("Error uploading file, please try again");
        return;
      });
  };

  const saveOrUpdateCollection = async (imageUrl?: string) => {
    if (props.collection) {
      await updateCollectionData(imageUrl);
    } else {
      await saveCollectionData(imageUrl);
    }
  };

  const saveCollectionData = async (imageUrl?: string) => {
    setIsLoading(true);
    const collectionData: Collection = {
      name: name.value,
      description: description.value,
      image: imageUrl,
    };
    saveCollection(collectionData)
      .then((response) => {
        setIsLoading(false);
        if (response && response.success) {
          showSuccessAlert("Collection saved successfully");
          props.reload();
          props.closeForm();
        }
      })
      .catch(() => {
        setIsLoading(false);
        showErrorAlert("Error saving collection, please try again");
      });
  };

  const updateCollectionData = async (imageUrl?: string) => {
    setIsLoading(true);
    const collectionData: Collection = {
      ...props.collection,
      name: name.value,
      description: description.value,
      image: imageUrl,
    };
    updateCollection(collectionData)
      .then((response) => {
        setIsLoading(false);
        if (response && response.success) {
          showSuccessAlert("Collection updated successfully");
          props.reload();
          props.closeForm();
        }
      })
      .catch(() => {
        setIsLoading(false);
        showErrorAlert("Error updating collection, please try again");
      });
  };

  return (
    <form className="w-full max-w-[800px]">
      <InputText
        id="inputTextCollectionName"
        label={"Name"}
        text={name}
        setText={setName}
        isRequired={true}
        minValueLength={2}
        maxValueLength={64}
        placeholder={"Collection name"}
      />

      <InputTextArea
        id="inputTextAreaCollectionDescription"
        styles={{ marginTop: "32px" }}
        label={"Description"}
        text={description}
        setText={setDescription}
        isRequired={false}
        minValueLength={0}
        maxValueLength={512}
        placeholder={"Collection description"}
      />

      <div className="mt-8">
        <span className="base-2 white mb-[10px] block">Image</span>
        <div className="flex mt-[10px] max-md:flex-col max-md:items-center">
          {props.collection && props.collection.image ? (
            <img src={props.collection?.image} alt={props.collection?.name} className="w-[108px] h-[108px] rounded-full object-cover" />
          ) : (
            <ImageIcon />
          )}

          <div className="flex-1 flex flex-col ml-4 max-md:w-full max-md:ml-0 max-md:mt-4">
            <InputFile file={image} setFile={setImage} />
            <p className="caption-1 secondary">
              At least 800x800 px recommended. JPG or PNG is allowed
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between mt-8 max-md:flex-col max-md:items-center">
        <ButtonPrimary
          text={"Save"}
          loading={isLoading}
          onClick={handleFormSubmit}
          disabled={!formValid}
        />
      </div>
    </form>
  );
};

export default CollectionForm;
