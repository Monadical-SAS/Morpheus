import styles from "./ArtworkSelect.module.scss";

interface ImageSelectProps {
  selected: boolean;
  handleSelect: (value: any) => any;
}

const ArtworkSelect = (props: ImageSelectProps) => {
  return props.selected ? (
    <div onClick={props.handleSelect} className={styles.ISContainer}>
      <span className="material-icons">check</span>
    </div>
  ) : null;
};

export default ArtworkSelect;
