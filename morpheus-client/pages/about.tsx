import MainContainer from "../layout/MainContainer/MainContainer";
import FAQ from "../components/FAQ/FAQ";
import { AppLink } from "@/components/AppLink/AppLink";
import ImagePrompt from "@/components/ImagePrompt/ImagePrompt";
import {
  ControlNetDescription,
  Img2ImgDescription,
  InpaintingDescription,
  Pix2PixDescription,
  Text2ImgDescription,
} from "@/components/ImagineActionsDescription/ImagineActionsDescription";
import styles from "../styles/pages/About.module.scss";

const About = () => {
  return (
    <MainContainer showFooter={true} style={{ justifyContent: "center" }}>
      <div className={styles.aboutContainer}>
        <section className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className="headline-1 white">
              Create breathtaking visuals in seconds:
            </h2>
            <p className="body-1 secondary">
              Morpheus effortlessly turns your imaginative concepts into
              artistic reality using keywords and styles.
            </p>
          </div>

          <img src="/images/redesign/aboutExample.svg" alt="Morpheus example" />
        </section>

        <section className={styles.about}>
          <p className="body-1 secondary">
            Morpheus is an experimental{" "}
            <AppLink
              href={"https://github.com/Monadical-SAS/Morpheus"}
              text={" open-source"}
            />
            project built by
            <AppLink href={"https://monadical.com/"} text={"Monadical"} />
            intended to lower the amount of expertise required to put
            open-source generative models into the hands of creators and
            professionals.
          </p>

          <p className="body-1 secondary">
            This project aims to provide a simplified, user-friendly frontend
            similar to the{" "}
            <AppLink
              href={"https://github.com/AUTOMATIC1111/stable-diffusion-webui"}
              text={"Stable Diffusion web UI"}
            />
            , with an accompanying back-end that automatically deploys any model
            to GPU instances with a load balancer.
          </p>

          <p className="body-1 secondary">
            We’re hoping to get some feedback from users like you! Do you find
            this useful? Are there features missing from our{" "}
            <a className="app-link body-1 main underline" href="#roadmap">
              roadmap
            </a>{" "}
            that you would like to see? Run into any problems or bugs? We want
            to hear about it! Contact us via{" "}
            <a
              className="body-1 main underline"
              href="mailto:hello@monadical.com"
            >
              email
            </a>{" "}
            or
            <AppLink
              href={"https://github.com/Monadical-SAS/Morpheus/issues"}
              text={"file an issue on github"}
            />
            .
          </p>
        </section>

        <section className={styles.frontEnd}>
          <h2 className="headline-2 white">Frontend</h2>
          <p className="body-1 secondary">
            Our hosted version of the Morpheus project supports text-to-image,
            image-to-image, pix2pix, ControlNet, and inpainting capabilities.
            Collaborative image editing (MSPaint-style) is also near completion.
          </p>

          <h3 className="headline-4 white">Text-to-Image: </h3>
          <Text2ImgDescription className="body-1 secondary" />

          <h3 className="headline-4 white">Image-to-Image: </h3>
          <Img2ImgDescription className="body-1 secondary" />

          <h3 className="headline-4 white">Pix2Pix: </h3>
          <Pix2PixDescription className="body-1 secondary" />

          <h3 className="headline-4 white">ControlNet: </h3>
          <ControlNetDescription className="body-1 secondary" />

          <h3 className="headline-4 white">Inpainting: </h3>
          <InpaintingDescription className="body-1 secondary" />
        </section>

        <section className={styles.backEnd}>
          <h2 className="headline-2 white">Backend</h2>

          <p className="body-1 secondary">
            The Morpheus project is designed to make deploying a generative
            image model as simple as possible.
          </p>

          <ul className="body-1 secondary">
            <li>
              Go to the Models Info YAML file and update it with the information
              for the new model:
              <div>
                <code>name: My new model name</code> <br />
                <code>description: My new model description</code> <br />
                <code>source: Hugging Face model ID</code>
              </div>
            </li>

            <li>
              Run the following command from your terminal: <br />
              <div>
                <code>
                  docker compose run --rm model-script upload local sdiffusion
                </code>
              </div>
            </li>

            <li>Refresh the browser, and the model will be ready to use.</li>
          </ul>

          <p className="body-1 secondary">
            You can find more information on how to do this at
            <AppLink
              href={
                "https://github.com/Monadical-SAS/Morpheus#installing-models-locally"
              }
              text={"here."}
            />
          </p>
        </section>

        <section className={styles.images}>
          <ImagePrompt
            image={"/images/redesign/about/morpheus.png"}
            prompt={
              "Unleash your imagination with Morpheus: Where dreams meet AI-powered artistry. " +
              "By Ken Fairclough and Dylan Cole, trending on behance, trending on artstation, award winning"
            }
          />

          <ImagePrompt
            image={"/images/redesign/about/creating.png"}
            prompt={
              "The god of dreams creating art  highly detailed, artstation, concept art, matte, sharp focus"
            }
          />

          <ImagePrompt
            image={"/images/redesign/about/unlock.png"}
            prompt={
              "A vision of the future of art, where human imagination and generative AI intertwine " +
              "to unlock a new dimension of creativity, symbolized by a key turning in a lock to " +
              "reveal a vibrant, surreal landscape"
            }
          />
        </section>

        <section className={styles.roadmap} id="roadmap">
          <h2 className="headline-2 white">Roadmap</h2>

          <h3 className="headline-4 white">
            Migrate to a plugin-based architecture:
          </h3>
          <p className="body-1 secondary">
            This will allow easy addition, modification, or removal of
            functionalities within the Morpheus codebase. It will also allow
            external contributors to propose new features as plugins and expose
            them in the Morpheus plugin marketplace.
          </p>

          <h3 className="headline-4 white">Support for Lora embeddings:</h3>
          <p className="body-1 secondary">
            This will allow users to choose from a wide variety of different
            styles when generating new images.
          </p>

          <h3 className="headline-4 white">
            Integrate ray.io as the model serving engine:
          </h3>
          <p className="body-1 secondary">
            Ray is a framework for scaling AI and Python applications in
            general. With this integration, the way models are served locally
            and in production will be unified, and the serving and scaling of
            models within the system will be improved.
          </p>

          <h3 className="headline-4 white">Administrator:</h3>
          <p className="body-1 secondary">
            This will allow the addition or removal of new models and styles
            through a graphical interface, simplifying the process.
          </p>
        </section>

        <section className={styles.faqContainer}>
          <FAQ />
        </section>
      </div>
    </MainContainer>
  );
};

export default About;
