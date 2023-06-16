import React, { Fragment, ReactNode, useState } from "react";
import { MinusIcon } from "../icons/minus";
import { PlusIcon } from "../icons/plus";
import {
  ControlNetDescription,
  Img2ImgDescription,
  InpaintingDescription,
  Pix2PixDescription,
  Text2ImgDescription,
} from "@/components/ImagineActionsDescription/ImagineActionsDescription";
import styles from "./FAQ.module.scss";

interface AccordionProps {
  title: string;
  content: string | ReactNode;
}

const Accordion = (props: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.accordion} ${isOpen && styles.open}`}>
      <div className={styles.accordionHeader} onClick={toggleAccordion}>
        {isOpen ? <MinusIcon /> : <PlusIcon />}
        <p className="headline-6 white">{props.title}</p>
      </div>

      {isOpen && (
        <div className={styles.accordionContent}>
          <p className="body-2 secondary">{props.content}</p>
        </div>
      )}
    </div>
  );
};

export const FAQ = () => {
  const faqs = [
    {
      title: "What is Morpheus?",
      content:
        "Morpheus is a cutting-edge AI-powered platform that rapidly and seamlessly creates breathtaking visuals " +
        "in mere seconds. With Morpheus, you can generate striking images based on keywords or styles, " +
        "and elevate your own uploads with a distinctive artistic touch.",
    },
    {
      title: "How does Morpheus work?",
      content:
        "Morpheus utilizes Stable Diffusion models to generate images. This advanced network is trained on " +
        "an extensive dataset of images, enabling it to learn and create images that closely resemble those " +
        "within the dataset.",
    },
    {
      title: "How do I get started?",
      content: (
        <p className="body-2 secondary">
          To embark on your Morpheus journey, simply begin by creating an
          account and generating your first image. Alternatively, if you prefer
          to run the Morpheus application on your personal computer, you can
          download the source code from{" "}
          <a
            className="body-2 main"
            href="https://github.com/Monadical-SAS/Morpheus"
          >
            GitHub
          </a>{" "}
          and follow the instructions outlined in the accompanying{" "}
          <a
            className="body-2 main"
            href="https://github.com/Monadical-SAS/Morpheus#readme"
          >
            README
          </a>{" "}
          file.
        </p>
      ),
    },
    {
      title: "How do I generate an image?",
      content:
        'To generate an image, simply navigate to the "Imagine" page and click on the "Generate" button',
    },
    {
      title: "Which services does Morpheus provide?",
      content: (
        <Fragment>
          <p className="body-2 secondary">
            Morpheus offers an extensive array of services, encompassing
            text-to-image, image-to-image, pix-to-pix, controlnet, and
            inpainting capabilities.
          </p>

          <ul>
            <li>
              <b>Text To Image:</b>{" "}
              <Text2ImgDescription className="body-2 secondary" />
            </li>
            <li>
              <b>Image To Image:</b>{" "}
              <Img2ImgDescription className="body-2 secondary" />
            </li>
            <li>
              <b>Pix To Pix:</b>{" "}
              <Pix2PixDescription className="body-2 secondary" />
            </li>
            <li>
              <b>ControlNet:</b>{" "}
              <ControlNetDescription className="body-2 secondary" />
            </li>
            <li>
              <b>Inpainting:</b>{" "}
              <InpaintingDescription className="body-2 secondary" />
            </li>
          </ul>
        </Fragment>
      ),
    },
  ];

  return (
    <div className={styles.FAQContainer}>
      <h2 className="headline-2 white">Frequently Asked Questions</h2>

      {faqs.map((faq, index) => (
        <Accordion key={index} title={faq.title} content={faq.content} />
      ))}
    </div>
  );
};

export default FAQ;
