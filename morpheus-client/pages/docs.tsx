import { useEffect, useState, useMemo } from "react";
import { CookiesStatus } from "@/utils/cookies";
import { MainLayout } from "@/layout/MainLayout/MainLayout";
import Pre from "@/components/Pre/Pre";
import { useAnalytics } from "@/context/GoogleAnalyticsContext";
import useHeadsObserver from "@/hooks/useHeadsObserver";
import { getMDXComponent } from "mdx-bundler/client";
import { GetStaticProps } from "next";
import { getMDXFile } from "@/utils/mdx";
import styles from "../styles/pages/Docs.module.scss";

const HEADING_LEVELS = ["h2", "h3", "h4"] as const;
type HeadingLevel = typeof HEADING_LEVELS[number];

interface HeadingProps {
  text: string;
  level: HeadingLevel;
  id: string;
  active?: boolean;
}

const HeadingLink = (props: HeadingProps) => {
  const headingStyles = {
    container: {
      [HEADING_LEVELS[0]]: styles.heading2Link,
      [HEADING_LEVELS[1]]: props.active ? styles.heading3LinkActive : styles.heading3LinkInactive,
      [HEADING_LEVELS[2]]: props.active ? styles.heading4LinkActive : styles.heading4LinkInactive,
    },
    text: {
      [HEADING_LEVELS[0]]: "base-1 primary font-semibold",
      [HEADING_LEVELS[1]]: props.active ? "base-2 primary font-semibold" : "base-2 secondary",
      [HEADING_LEVELS[2]]: props.active ? "base-2 primary font-semibold" : "base-2 secondary",
    },
  };

  return (
    <div className={headingStyles.container[props.level]}>
      <a
        href={`#${props.id}`}
        className={headingStyles.text[props.level]}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(props.id)?.scrollIntoView({ block: 'center', behavior: "smooth" });
        }}
      >
        {props.text}
      </a>
    </div>
  );
};

const getHeadings = (props: HeadingProps[]) => {
  const headings = props.map((heading, index) => {
    return <HeadingLink key={index} {...heading} />;
  });
  return headings;
};

interface PostProps {
  code: string;
}

const Docs = ({ code }: PostProps) => {
  const { cookiesStatus, sendAnalyticsRecord } = useAnalytics();
  const [headings, setHeadings] = useState<{ text: string }[]>([]);
  const { activeId } = useHeadsObserver();

  const MDX = useMemo(() => getMDXComponent(code), [code]);

  useEffect(() => {
    let elements = Array.from(document.querySelectorAll(HEADING_LEVELS.join(", "))).map((elem) => ({
      id: elem.id,
      text: (elem as HTMLElement).innerText,
      level: `h${Number(elem.nodeName.charAt(1))}`,
      active: false,
    }));

    elements = elements.filter(element => element.id)

    let isActiveFound = true;

    for (let element of elements) {
        if (element.id === activeId) {
            isActiveFound = false;
        }
        element.active = isActiveFound || element.id === activeId;
    }
    setHeadings(elements);
}, [activeId]);



  useEffect(() => {
    if (cookiesStatus === CookiesStatus.Accepted) {
      sendAnalyticsRecord("page_view", {
        page_location: window.location.href,
        page_title: document?.title,
        page_name: "Docs",
      });
    }
  }, [cookiesStatus, sendAnalyticsRecord]);

  return (
    <MainLayout showFooter={true}>
      <div className={styles.docsWrapper}>
        <div className={styles.tableOfContents}>{getHeadings(headings as HeadingProps[])}</div>
        <div className={styles.content}>
          <MDX components={{ pre: Pre }} />
        </div>
      </div>
    </MainLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const post = await getMDXFile("README.mdx");
  return {
    props: {
      ...post,
    },
  };
};

export default Docs;
