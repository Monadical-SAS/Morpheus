import React from "react";
import Brand from "../Typography/Brand/Brand";
import { TwitterIcon } from "@/components/icons/twitter";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { GithubIcon } from "@/components/icons/github";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-[72px] flex items-center bg-[#14172D] max-md:h-auto max-md:flex-col max-md:text-center">
      <div className="flex-[2] flex justify-start gap-6 max-md:mb-4 max-md:order-1">
        <Brand styles={{ fontSize: "20px" }} />
      </div>

      <div className="flex-[4] flex justify-center gap-6 max-md:mb-6 max-md:order-3">
        <a className="body-1 main underline" href="mailto:hello@monadical.com">
          Contact us
        </a>
      </div>

      <div className="flex-[2] flex justify-end gap-6 max-md:mb-6 max-md:order-2">
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
