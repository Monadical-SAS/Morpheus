import React, { useState, useEffect } from "react";

import Modal from "@/components/Modal/Modal";
import styles from "./WalkthroughApp.module.scss";
import Button from "../buttons/Button/Button";
import { useAuth } from "@/context/AuthContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { MOBILE_SCREEN_WIDTH } from "@/utils/constants";
import { updateUserInfo, getUserInfo } from "@/services/users";

type SlideSectionsType = {
  [key: string]: React.ReactElement;
  section1: React.ReactElement;
  section2: React.ReactElement;
  section3: React.ReactElement;
  section4: React.ReactElement;
  section5: React.ReactElement;
  section6: React.ReactElement;
};

const SlidesSections: SlideSectionsType = {
  section1: (
    <div className={styles.section}>
      <span className={`headline-1 ${styles.welcomeTitle}`}>Welcome to Morpheus</span>
      <img src="/images/walkthroughApp/section-1.png" alt="Welcome to Morpheus" />
    </div>
  ),
  section2: (
    <div className={styles.section}>
      <img src="/images/walkthroughApp/section-2.png" alt="Welcome to Morpheus" />
      <p className="headline-5">Morpheus is an open source platform for exploring different visual AI models</p>
    </div>
  ),
  section3: (
    <div className={styles.section}>
      <img src="/images/walkthroughApp/section-3.png" alt="Welcome to Morpheus" />
      <p className="headline-5">You can use one of the many models provided, or add your own</p>
    </div>
  ),
  section4: (
    <div className={styles.section}>
      <img src="/images/walkthroughApp/section-4.png" alt="Welcome to Morpheus" />
      <p className="headline-5">
        Click the Magic Prompt button to augment your prompt with more descriptive, detailed, and stylized instructions,
        resulting in more interesting images
      </p>
    </div>
  ),
  section5: (
    <div className={styles.section}>
      <img src="/images/walkthroughApp/section-5.png" alt="Welcome to Morpheus" />
      <p className="headline-5">
        Use the settings to further modify your generated images, getting into the details of size, steps, and more
      </p>
    </div>
  ),
  section6: (
    <div className={styles.section}>
      <img src="/images/walkthroughApp/section-6.png" alt="Welcome to Morpheus" />
      <p className="headline-5">
        Morpheus is also easily expanded for your own projects and needs. Just fork it on github!
      </p>
    </div>
  ),
};

const indicatorStyles = {
  active: styles.indicatorActive,
  inactive: styles.indicatorInactive,
};

type IndicatorStatus = keyof typeof indicatorStyles;

const getIndicatorStyle = (status: IndicatorStatus) => {
  return indicatorStyles[status];
};

const sections = ["section1", "section2", "section3", "section4", "section5", "section6"];

const WalkthroughApp = () => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const isMobile = useWindowDimensions().width < MOBILE_SCREEN_WIDTH;
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getUserInfo(user.email).then((response) => {
        setShowModal(response.data.is_new_user);
      });
    }
  }, [user]);

  useEffect(() => {
    if (showModal && sectionIndex === 0) {
      updateUserInfo({ ...user, is_new_user: false });
    }
  }, [user, sectionIndex, showModal]);

  const getPreviousSection = () => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
    }
  };

  const getNextSection = () => {
    if (sectionIndex < sections.length - 1) {
      setSectionIndex(sectionIndex + 1);
    }
    if (sectionIndex === sections.length - 1) {
      setShowModal(false);
    }
  };

  return (
    <Modal
      showHeader={false}
      width={"850px"}
      height={isMobile ? "600px" : "700px"}
      isOpen={showModal}
      styles={{
        backgroundColor: "white",
        padding: "30px 40px",
      }}
      toggleModal={() => {}}
    >
      <div className={styles.walkthroughAppWrapper}>
        <div className={styles.content}>
          {React.cloneElement(SlidesSections[sections[sectionIndex]], { key: sections[sectionIndex] })}
        </div>
        <div className={sectionIndex > 0 ? styles.allButtons : styles.onlyRightButton}>
          {sectionIndex > 0 && (
            <Button
              onClick={() => getPreviousSection()}
              loading={false}
              text={"Previous"}
              variant="tertiary"
              styles={{ maxWidth: "120px", zIndex: 10 }}
            />
          )}
          <div className={styles.indicators}>
            {sections.map((section) => (
              <div
                key={section}
                className={getIndicatorStyle(sections[sectionIndex] === section ? "active" : "inactive")}
                onClick={() => setSectionIndex(sections.indexOf(section))}
              />
            ))}
          </div>
          <Button
            loading={false}
            text={"Next"}
            styles={{ maxWidth: "120px", zIndex: 10 }}
            onClick={() => getNextSection()}
          />
        </div>
      </div>
    </Modal>
  );
};

export default WalkthroughApp;
