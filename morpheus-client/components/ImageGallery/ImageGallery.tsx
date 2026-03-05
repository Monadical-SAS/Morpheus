import Loader from "../Loaders/LoaderImages/Loader";
import ArtworkCard from "../ArtworkCard/ArtworkCard";
import { ImageIcon } from "../icons/image";
import { ImagineResult, useImagine } from "@/context/ImagineContext";
import { Fragment } from "react";

const ImageGallery = () => {
  const { isLoading, resultImages } = useImagine();

  return (
    <Fragment>
      {isLoading && (
        <div
          className={`flex justify-center items-center h-full w-full min-h-[420px] flex-1 max-md:min-h-0 ${
            resultImages.length > 0 ? "h-[300px]" : ""
          }`}
        >
          <Loader />
        </div>
      )}

      {resultImages?.length > 0 ? (
        <div className="w-full flex flex-col">
          {resultImages.map((result: ImagineResult, indexParent: number) => (
            <div className="w-full mb-12 last:mb-2" key={indexParent}>
              <p className="body-2 white mb-4">{result.prompt.prompt}</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 max-md:!grid-cols-[repeat(auto-fill,minmax(100%,1fr))] max-md:p-0">
                {result.images.map((image: string, index: number) => (
                  <ArtworkCard
                    key={`${image}-${indexParent}-${index}`}
                    artwork={{ image: image || "", prompt: result.prompt }}
                    isModalEnabled={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`flex justify-center items-center h-full w-full min-h-[420px] flex-1 max-md:min-h-0 ${isLoading ? "hidden" : ""}`}
        >
          <ImageIcon />
        </div>
      )}
    </Fragment>
  );
};

export default ImageGallery;
