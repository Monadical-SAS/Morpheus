import React from "react";
import Brand from "../Typography/Brand/Brand";
import { TwitterIcon } from "@/components/icons/twitter";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { GithubIcon } from "@/components/icons/github";
import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.leftContent}>
        <Brand styles={{ fontSize: "20px" }} />
      </div>

      <div className={styles.middleContent}>
        <a className="body-1 main underline" href="mailto:hello@monadical.com">
          Contact us
        </a>
      </div>

      <div className={styles.rightContent}>
        <a
          href="https://github.com/Monadical-SAS/Morpheus"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon />
        </a>

        <a
          href="https://twitter.com/MonadicalHQ"
          target="_blank"
          rel="noreferrer"
        >
          <TwitterIcon />
        </a>

        <a
          href="https://www.linkedin.com/company/monadical"
          target="_blank"
          rel="noreferrer"
        >
          <LinkedinIcon />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
