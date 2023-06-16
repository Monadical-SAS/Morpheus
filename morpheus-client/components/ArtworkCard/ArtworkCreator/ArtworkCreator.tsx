import { User } from "@/models/models";
import styles from "./ArtworkCreator.module.scss";
import { UserIcon } from "../../icons/user";

interface ImageCreatorProps {
  creator: User;
}

const ArtworkCreator = (props: ImageCreatorProps) => {
  return (
    <div className={styles.creatorContainer}>
      {props.creator?.avatar ? (
        <img src={props.creator.avatar} alt="avatar" loading="lazy" />
      ) : (
        <UserIcon width={"48px"} height={"48px"} />
      )}
      <div className={styles.creatorInfo}>
        <p className="body-3 secondary">{props.creator.name}</p>
        <p className="body-2 white">{props.creator.email}</p>
      </div>
    </div>
  );
};

export default ArtworkCreator;
