import InputSearch from "../Inputs/InputSearch/InputSearch";
import ButtonPrimary from "../buttons/ButtonPrimary/ButtonPrimary";
import { useState } from "react";
import { searchArtWorks } from "@/services/artworks";
import { useToastContext } from "@/context/ToastContext";
import { initialText, TextState } from "../Inputs/InputText/InputText";
import { ArtWork } from "@/models/models";

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
    <div className="w-full flex flex-col mb-12">
      <h2 className="headline-1 white">Explore</h2>

      <div className="mt-12 flex flex-row items-center gap-6">
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
