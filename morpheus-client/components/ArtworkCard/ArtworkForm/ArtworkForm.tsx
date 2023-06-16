import React, { useEffect, useState } from "react";
import ButtonPrimary from "../../buttons/ButtonPrimary/ButtonPrimary";
import CollectionSelect from "../../CollectionSelect/CollectionSelect";
import { CloseIcon } from "../../icons/close";
import { saveArtWork, updateArtWork } from "@/services/artworks";
import { useToastContext } from "@/context/ToastContext";
import InputText, {
  initialText,
  TextState,
} from "../../Inputs/InputText/InputText";
import { ArtWork } from "@/models/models";
import styles from "./ArtworkForm.module.scss";

interface ArtworkFormProps {
  artwork?: ArtWork;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  setArtworkId?: (id: string) => void;
  refreshArtworks?: () => void;
}

const ArtworkForm = (props: ArtworkFormProps) => {
  const { showSuccessAlert, showInfoAlert, showErrorAlert } = useToastContext();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState<TextState>(initialText);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  useEffect(() => {
    if (props.artwork && props.artwork.title) {
      setTitle({ value: props.artwork.title, validators: [] });
    }

    if (props.artwork && props.artwork.collection_id) {
      setSelectedCollectionId(props.artwork.collection_id);
    }
  }, [props.artwork]);

  useEffect(() => {
    if (title && title.value) {
      setIsFormValid(true);
    }
  }, [title]);

  const handleCancel = () => {
    setTitle(initialText);
    props.setShowForm(false);
  };

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();

    if (props.artwork?.id) {
      await handleUpdateArtwork();
    } else {
      await handleSaveArtWork();
    }
  };

  const handleSaveArtWork = async () => {
    if (!props.artwork) {
      showInfoAlert("No artwork selected");
      return;
    }

    setIsLoading(true);
    const newArtWork = {
      ...props.artwork,
      title: title.value,
      collection_id: selectedCollectionId,
    };

    saveArtWork(newArtWork)
      .then((response) => {
        if (response && response.success) {
          showSuccessAlert("Artwork saved successfully");
          props.setArtworkId && props.setArtworkId(response.data.id);
          handleResetForm();
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        showErrorAlert("Error saving artwork, please try again");
      });
  };

  const handleUpdateArtwork = () => {
    if (!props.artwork) {
      showInfoAlert("No artwork selected");
      return;
    }
    const newArtWork = {
      ...props.artwork,
      title: title.value,
      collection_id: selectedCollectionId,
    };

    updateArtWork(newArtWork)
      .then((response) => {
        if (response && response.success) {
          showSuccessAlert("Artwork updated successfully");
          handleResetForm();
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        showErrorAlert("Error updating the artwork, please try again");
      });
  };

  const handleResetForm = () => {
    props.setShowForm(false);
    props.refreshArtworks && props.refreshArtworks();
  };

  if (!props.artwork) {
    return null;
  }

  return props.showForm ? (
    <div className={styles.artworkForm}>
      <CollectionSelect
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={setSelectedCollectionId}
      />

      <InputText
        id="inputTextArtworkName"
        label="Name your artwork"
        text={title}
        setText={setTitle}
        maxValueLength={256}
        isRequired={true}
        placeholder={"Artwork name"}
        styles={{ marginTop: "24px" }}
      />

      <div className={styles.buttonsContainer}>
        <span className={styles.cancelIcon} onClick={handleCancel}>
          <CloseIcon />
        </span>

        <ButtonPrimary
          text={`${props.artwork.id ? "Update" : "Save"}`}
          loading={isLoading}
          onClick={handleFormSubmit}
          disabled={!isFormValid}
        />
      </div>
    </div>
  ) : null;
};

export default ArtworkForm;
