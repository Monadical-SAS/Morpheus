import { CSSProperties, Fragment } from "react";
import RoundedIcon from "../RoundedIcon/RoundedIcon";
import Modal from "../Modal/Modal";
import { useModal } from "../../hooks/useModal";
import styles from "./HelpPrompt.module.scss";

const HelpContent = () => {
  return (
    <div className={styles.helpContent}>
      <h1 className="bold40">Prompt Basics</h1>
      <p className="body">Let’s first understand the structure of a prompt.</p>
      <p className={`bodyBold ${styles.highlight}`}>
        (subject)(style), (action/scene), (artist), (filters)
      </p>
      <p className="body">
        Following this basic rule you will be able to generate some decent
        images.
      </p>
      <p className="heading">(subject)</p>
      <p className="body">
        This is the basic building block of any prompt. The so called raw
      </p>
      <p className={`bodyBold ${styles.highlight}`}>
        prompt. Ex: a black horse.
      </p>
      <p className="heading">(style)</p>
      <p className="body">
        Style is a crucial part of the prompt. The AI, when missing a specified
        style, usually chooses the one it has seen the most in related images,
        for example, if I request for a landscape, it would probably generate
        realistic or oil painting looking images. Having a well chosen style +
        raw prompt is sometimes enough, as the style influences the image the
        most right after the raw prompt.
      </p>
      <p className="heading">(action/scene)</p>
      <p className="body">
        The action describes what the subject is actually doing and the scene
        describes where.
      </p>
      <p className={`bodyBold ${styles.highlight}`}>
        Example: jumping in the forest
      </p>
      <p className="heading">(filters)</p>
      <p className="body">
        Filters are the extra sauce that you add to your prompt to make it look
        like you want. For instance, if you want to make your image more
        artistic, add “trending on artstation”. If you want to add more
        realistic lighting add “Unreal Engine.” You can be creative and add any
        filter that you want, but here are some examples:
      </p>
      <p className={`bodyBold ${styles.highlight}`}>
        Highly detailed, surrealism, trending on art station, triadic color
        scheme, smooth, sharp focus, matte, elegant, the most beautiful image
        ever seen, illustration, digital paint, dark, gloomy, octane render, 8k,
        4k, washed colours, sharp, dramatic lighting, beautiful, post
        processing, picture of the day, ambient lighting, epic composition
      </p>
      <p className="body">Here is a final example using this basic rule:</p>
      <p className={`bodyBold ${styles.highlight}`}>
        realistic art of a black horse, in the forest, by marc simonetti, fog,
        centered, symmetry, painted, intricate, volumetric lighting, beautiful,
        rich deep colours, masterpiece, sharp focus, ultra detailed, 4k
      </p>

      <div className={styles.reference}>
        <p className="heading">Reference:</p>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://diffusion-news.org/stable-diffusion-settings-parameters/"
        >
          Diffusion News: Stable Diffusion Settings and Parameters
        </a>
      </div>
    </div>
  );
};

interface HelpPromptProps {
  styles?: CSSProperties;
}

const HelpPrompt = (props: HelpPromptProps) => {
  const { isOpen, toggleModal } = useModal();

  return (
    <Fragment>
      <div style={props.styles}>
        <RoundedIcon
          styles={{ width: "35px", height: "35px" }}
          icon={"question_mark"}
          onClick={toggleModal}
        />
      </div>

      <Modal isOpen={isOpen} toggleModal={toggleModal}>
        <HelpContent />
      </Modal>
    </Fragment>
  );
};

export default HelpPrompt;
