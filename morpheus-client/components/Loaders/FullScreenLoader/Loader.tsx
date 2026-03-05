import Loader from "../LoaderCircle/Loader";

type FullScreenLoaderProps = {
  isLoading: boolean;
};

const FullScreenLoader = (props: FullScreenLoaderProps) => {
  return (
    <div className="w-screen h-screen absolute top-0 left-0 z-[9999] flex justify-center items-center">
      <Loader
        isLoading={props.isLoading}
        message={"Loading..."}
        fontColor={"main"}
      />
    </div>
  );
};

export default FullScreenLoader;
