import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./UnderConstruction.module.scss";

interface UnderConstructionProps {
  title?: string;
  variant?: "normal" | "small";
}

const UnderConstruction = (props: UnderConstructionProps) => {
  const router = useRouter();

  const handleClickToAction = useCallback(async () => {
    await router.push("/imagine/text2img");
  }, [router]);

  return (
    <div
      className={`${styles.textContent} ${
        props.variant === "small" && styles.small
      }`}
    >
      <h2 className="bold40 white">{props.title}</h2>
      <hr />
      <p className="heading white">
        This site is under construction. Please come back later.
      </p>

      <button className="buttonSubmit" onClick={handleClickToAction}>
        Go to Text2Img
      </button>
    </div>
  );
};

export default UnderConstruction;
