import RoundedIcon from "../RoundedIcon/RoundedIcon";

interface ImageActionsProps {
  showCollections: boolean;
  setShowCollections: (show: boolean) => void;
}

const GalleryActions = (props: ImageActionsProps) => {
  return (
    <div className="absolute top-2 left-2">
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
