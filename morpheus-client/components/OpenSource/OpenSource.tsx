import Button from "@/components/buttons/Button/Button";
import { StarIcon } from "@/components/icons/star";
import styles from "./OpenSource.module.scss";

export const OpenSource = () => {
  return (
    <div className={styles.openSource}>
      <div className={styles.openSourceTitle}>
        <span className={styles.icon}>
          <StarIcon />
        </span>
        <p className="font-bold base-1 main">Morpheus is open source!</p>
      </div>

      <p className="base-1 primary">
        Easily add your own AI models or functionality, extending Morpheus for
        your own project needs.
      </p>

      <Button
        loading={false}
        onClick={() =>
          window.open("https://github.com/Monadical-SAS/Morpheus/fork")
        }
        text={"Fork on GitHub"}
      />
    </div>
  );
};
