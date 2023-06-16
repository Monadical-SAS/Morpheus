import RoundedIcon from "../RoundedIcon/RoundedIcon";
import styles from "./GalleryActions.module.scss";

interface ImageActionsProps {
  showCollections: boolean;
  setShowCollections: (show: boolean) => void;
}

const GalleryActions = (props: ImageActionsProps) => {
  return (
    <div className={styles.actionButtons}>
      <RoundedIcon
        status={props.showCollections}
        icon={"folder"}
        onClick={() => props.setShowCollections(true)}
      />
      <RoundedIcon
        status={!props.showCollections}
        icon={"grid_view"}
        onClick={() => props.setShowCollections(false)}
      />
    </div>
  );
};

export default GalleryActions;
