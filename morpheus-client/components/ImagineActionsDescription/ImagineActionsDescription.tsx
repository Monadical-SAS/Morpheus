import { AppLink } from "@/components/AppLink/AppLink";

interface DescriptionProps {
  className?: string;
}

export const Text2ImgDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Text-to-image uses a diffusion model to translate written descriptions into
    images, like DALL-E or MidJourney. Results will vary widely depending on the
    words used in the prompt. If you want some help, click the magic wand
    icon--this will use a language model to “enhance” your prompt for you. In
    the settings, you’ll also find a default “negative prompt” that you can
    modify as needed.
  </p>
);

export const Img2ImgDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Image-to-image applies the same class of models as Text-to-Image, but
    instead of text, you provide an image to serve as the starting point for the
    model. A common use-case would be providing a hand-drawn image and
    describing what your sketch should look like when it’s finished.
  </p>
);

export const Pix2PixDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Similar to Image-to-image, pix2pix starts with an image you provide, but the
    model has been trained to take editing instructions in the form of “X to Y”.
    Check out some examples{" "}
    <AppLink
      href={"https://stable-diffusion-art.com/instruct-pix2pix"}
      text={"here."}
    />
  </p>
);

export const ControlNetDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    ControlNet provides precise control over image generation. By incorporating
    high-level instructions or control signals, it allows users to influence
    specific aspects of the generated images, such as pose, appearance, or
    object attributes. See more details{" "}
    <AppLink
      href={"https://stable-diffusion-art.com/controlnet"}
      text={"here."}
    />
  </p>
);

export const InpaintingDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Inpainting allows you to draw a “mask” over an image, which means the model
    will only change the section of the image covered by the mask. The model can
    remove unwanted elements, replace them with something else, or add new
    elements to an existing image. See more details{" "}
    <AppLink
      href={"https://stable-diffusion-art.com/inpainting_basics"}
      text={"here."}
    />
  </p>
);
