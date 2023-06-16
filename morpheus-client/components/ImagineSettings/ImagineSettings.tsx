import React, { Fragment } from "react";
import Modal from "../Modal/Modal";
import { SDOption, useDiffusion } from "@/context/SDContext";
import ControlNetModelSelect from "../ControlNetModelSelect/ControlNetModelSelect";
import InputNumber from "../Inputs/InputNumber/InputNumber";
import InputSeed from "../Inputs/InputSeed/InputSeed";
import InputSelect from "../Inputs/InputSelect/InputSelect";
import InputTextArea from "../Inputs/InputTextArea/InputTextArea";
import ModelSelect from "../ModelSelect/ModelSelect";
import SamplerSelect from "../SamplerSelect/SamplerSelect";
import AppTooltip from "@/components/Tooltip/AppTooltip";
import { CloseIcon } from "../icons/close";
import { InfoIcon } from "../icons/info";
import { SettingsIcon } from "../icons/settings";
import { useShowSettings } from "@/hooks/useShowSettings";
import styles from "./ImagineSettings.module.scss";

interface OptionState {
  title: string;
  description: string;
}

const OptionInfo = (props: OptionState) => {
  return (
    <Fragment>
      <div className={styles.title}>
        <p className="base-2 white">{props.title}</p>

        <span className={styles.infoIcon}>
          <InfoIcon />

          <div className={styles.cardInfo}>
            <p className="caption-1 white">{props.description}</p>
          </div>
        </span>
      </div>
    </Fragment>
  );
};

const ImagineSettings = () => {
  const { showSettings, toggleSettings } = useShowSettings();

  const {
    selectedOption,
    imageSize,
    setImageSize,
    scale,
    setScale,
    strength,
    setStrength,
    steps,
    setSteps,
    amount,
    setAmount,
    negativePrompt,
    setNegativePrompt,
  } = useDiffusion();

  const SettingsContent = (
    <div className={styles.settingsContainer}>
      <div className={styles.optionsContainer}>
        <div className={styles.settingItem}>
          <OptionInfo
            title={"Image Size"}
            description={"Resize image to target resolution."}
          />

          <InputSelect
            options={[
              "480x480",
              "512x512",
              "640x640",
              "720x720",
              "768x768",
              "1024x1024",
            ]}
            selected={imageSize}
            setSelected={setImageSize}
          />
        </div>

        <div className={styles.settingItem}>
          <OptionInfo title={"Model"} description={"Select a model to use."} />
          <ModelSelect />
        </div>

        {selectedOption === SDOption.ControlNet && (
          <div className={styles.settingItem}>
            <OptionInfo
              title={"ControlNet Model"}
              description={
                "Select a ControlNet model to use. This only works with stable diffusion v1.5."
              }
            />
            <ControlNetModelSelect />
          </div>
        )}

        <div className={styles.settingItem}>
          <OptionInfo
            title={"Sampler"}
            description={"Select a sampler to use."}
          />
          <SamplerSelect />
        </div>

        <div className={styles.settingItem}>
          <OptionInfo
            title={"CFG Scale"}
            description={
              "Classifier Free Guidance Scale.  This parameter controls how strongly the image " +
              "should conform to prompt. Lower values produce more creative results."
            }
          />

          <InputNumber
            id="inputNumberScale"
            number={scale}
            setNumber={setScale}
            minValue={1}
            maxValue={20}
            isRequired={true}
          />
        </div>

        {(selectedOption === SDOption.Image2Image ||
          selectedOption === SDOption.ControlNet) && (
          <div className={styles.settingItem}>
            <OptionInfo
              title={"Strength"}
              description={
                "This parameter controls how much the reference image is transformed by adjusting the amount " +
                "of added noise. The value must be between 0 and 1, where 0 adds no noise and returns the same " +
                "input image, and 1 completely replaces the image with noise."
              }
            />

            <InputNumber
              id="inputNumberStrength"
              minValue={0}
              maxValue={1}
              step={0.01}
              number={strength}
              setNumber={setStrength}
            />
          </div>
        )}

        <div className={styles.settingItem}>
          <OptionInfo
            title={"Number of Steps"}
            description={
              "This parameter controls how many times the generated image is iteratively improved. " +
              "Higher values are better quality but take longer, while very low values are faster but can produce " +
              "less desirable results."
            }
          />

          <InputNumber
            id="inputNumberSteps"
            minValue={0}
            maxValue={150}
            number={steps}
            setNumber={setSteps}
          />
        </div>

        <div className={styles.settingItem}>
          <OptionInfo
            title={"Number of Images"}
            description={
              "How many images to create in a single run.  Higher values will take longer."
            }
          />

          <InputNumber
            id="inputNumberAmount"
            minValue={1}
            maxValue={4}
            number={amount}
            setNumber={setAmount}
          />
        </div>

        <div className={styles.settingItem}>
          <OptionInfo
            title={"Seed Generator"}
            description={
              "The seed value controls the output from the random number generator.  Using the same seed " +
              "with the same model parameters will generate the same image every time.  A value of -1 will use a " +
              "random seed every time."
            }
          />

          <InputSeed />
        </div>

        <div className={styles.settingItemNegativePrompt}>
          <OptionInfo
            title={"Negative prompt"}
            description={
              "Describe what you don't want to see in the generated images."
            }
          />
          <InputTextArea
            id="textAreaNegativePrompt"
            text={negativePrompt}
            setText={setNegativePrompt}
            isRequired={false}
            placeholder={"Enter your negative prompt here."}
            color={"white"}
            numRows={5}
            showCount={true}
            disableGrammarly={true}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Fragment>
      <AppTooltip content={"Settings"} direction={"top"}>
        {showSettings ? (
          <span className={styles.rightBarIconClose} onClick={toggleSettings}>
            <CloseIcon />
          </span>
        ) : (
          <span className={styles.rightBarIcon} onClick={toggleSettings}>
            <SettingsIcon />
          </span>
        )}
      </AppTooltip>

      <Modal
        showHeader={true}
        headerContent={<h2 className="headline-4 white">Settings</h2>}
        height={"auto"}
        isOpen={showSettings}
        toggleModal={toggleSettings}
      >
        {SettingsContent}
      </Modal>
    </Fragment>
  );
};

export default ImagineSettings;
