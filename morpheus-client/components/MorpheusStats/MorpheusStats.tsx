import styles from "./MorpheusStats.module.scss";

const MorpheusStats = () => {
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <div className={styles.item}>
          <p className="headline-3 accent">50.000+</p>
          <p className="body-2 white">Images rendered</p>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.item}>
          <p className="headline-3 accent">300+</p>
          <p className="body-2 white">Users</p>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={styles.item}>
          <p className="headline-3 accent">6</p>
          <p className="body-2 white">Awards</p>
        </div>
      </div>
    </div>
  );
};

export default MorpheusStats;
