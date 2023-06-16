import InputSearch from "../Inputs/InputSearch/InputSearch";
import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import { useState } from "react";
import { searchArtWorks } from "@/services/artworks";
import { useToastContext } from "@/context/ToastContext";
import { initialText, TextState } from "../Inputs/InputText/InputText";
import { ArtWork } from "@/models/models";
import styles from "./SearchForm.module.scss";

interface SearchFormProps {
  setUserArtWorks: (images: Array<ArtWork>) => void;
}

const SearchForm = (props: SearchFormProps) => {
  const { showErrorAlert } = useToastContext();

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState<TextState>(initialText);

  const handleSearchImages = () => {
    setSearchLoading(true);
    searchArtWorks(searchText.value)
      .then((response) => {
        if (response.success) {
          props.setUserArtWorks(response.data);
        }
        setSearchLoading(false);
      })
      .catch(() => {
        showErrorAlert("Error while getting user images");
        setSearchLoading(false);
      });
  };

  return (
    <div className={styles.searchFormContainer}>
      <h2 className="headline-1 white">Explore</h2>

      <div className={styles.searchContent}>
        <InputSearch
          text={searchText}
          setText={setSearchText}
          showLabel={false}
        />

        <ButtonPrimary
          styles={{ width: "192px" }}
          loading={searchLoading}
          text={"Search..."}
          onClick={handleSearchImages}
        />
      </div>
    </div>
  );
};

export default SearchForm;
