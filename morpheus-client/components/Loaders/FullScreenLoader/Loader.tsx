import Loader from "../LoaderCircle/Loader";
import styles from "./Loader.module.scss";

type FullScreenLoaderProps = {
  isLoading: boolean;
};

const FullScreenLoader = (props: FullScreenLoaderProps) => {
  return (
    <div className={styles.fullScreenLoader}>
      <Loader
        isLoading={props.isLoading}
        message={"Loading..."}
        fontColor={"main"}
      />
    </div>
  );
};

export default FullScreenLoader;
