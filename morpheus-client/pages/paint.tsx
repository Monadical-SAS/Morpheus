import MainContainer from "../layout/MainContainer/MainContainer";
import Excalidraw from "../components/Excalidraw/Excalidraw";
import styles from "../styles/pages/Paint.module.scss";

const Paint = () => {
  return (
    <MainContainer>
      <div className={styles.mainContent}>
        <Excalidraw />
      </div>
    </MainContainer>
  );
};

export default Paint;
