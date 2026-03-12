import CircleLoader from "@/components/molecules/CircleLoader/CircleLoader";

type FullScreenLoaderProps = {
  isLoading: boolean;
};

const FullScreenLoader = (props: FullScreenLoaderProps) => {
  return (
    <div className="w-screen h-screen absolute top-0 left-0 z-[9999] flex justify-center items-center">
      <CircleLoader
        isLoading={props.isLoading}
        message={"Loading..."}
        fontColor={"main"}
      />
    </div>
  );
};

export default FullScreenLoader;
