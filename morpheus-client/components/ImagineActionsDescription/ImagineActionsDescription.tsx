import { AppLink } from "@/components/AppLink/AppLink";

interface DescriptionProps {
  className?: string;
}

export const Text2ImgDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Text-to-image uses a diffusion model to translate written descriptions into images, like DALL-E or MidJourney.
  </p>
);

export const Img2ImgDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Image-to-image applies the same class of models as Text-to-Image, but uses an image instead of text for the starting
    point. A common use-case would be giving the model a hand-drawn picture and a description to dictate the resulting
    image.
  </p>
);

export const Pix2PixDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Similar to Image-to-image, pix2pix starts with an image, but takes further editing instructions in the form of “X to
    Y”. See more details <AppLink href={"https://stable-diffusion-art.com/instruct-pix2pix"} text={"here."} />
  </p>
);

export const ControlNetDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    ControlNet provides precise control over image generation. By incorporating high-level instructions (or control
    signals), it allows users to influence specific aspects of the generated images. These can be factors such as pose,
    appearance, or object attributes. See more details{" "}
    <AppLink href={"https://stable-diffusion-art.com/controlnet"} text={"here."} />
  </p>
);

export const InpaintingDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    InPainting allows you to draw a mask over the section of an image you would like changed. The model can remove
    unwanted elements, replace elements with other content, or add entirely new elements to the image. See more details{" "}
    <AppLink href={"https://stable-diffusion-art.com/inpainting_basics"} text={"here."} />
  </p>
);

export const UpscalingDescription = (props: DescriptionProps) => (
  <p className={props.className}>
    Upscaling refers to the process of increasing the size or resolution of an image while preserving or improving its
    quality. Upscaling takes an existing image and enhances its details, making it appear clearer and sharper. It can
    take a low-resolution image and intelligently upscale it by adding noise in a controlled manner, resulting in a
    higher-quality and more detailed image.
  </p>
);
