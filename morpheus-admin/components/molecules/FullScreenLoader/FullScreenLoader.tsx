import styles from "./FullScreenLoader.module.scss";
import CircleLoader from "@/components/molecules/CircleLoader/CircleLoader";

type FullScreenLoaderProps = {
  isLoading: boolean;
};

const FullScreenLoader = (props: FullScreenLoaderProps) => {
  return (
    <div className={styles.fullScreenLoader}>
      <CircleLoader
        isLoading={props.isLoading}
        message={"Loading..."}
        fontColor={"main"}
      />
    </div>
  );
};

export default FullScreenLoader;
