import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import styles from "./Slider.module.scss";
import "swiper/css/navigation";
import "swiper/css";
import Image from "next/image";
import ImageWrapper from "../ImageWrapper/ImageWrapper";

const Slider = () => {
  const images = Array.from({ length: 16 }, (_, i) => `image${i + 1}.png`);

  return (
    <div className={styles.sliderContainer}>
      <Swiper
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
      >
        {images.map((image) => (
          <SwiperSlide key={image}>
            <ImageWrapper
              child={
                <Image
                  src={`/images/slider/${image}`}
                  alt="An example image"
                  sizes="(max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 100vw"
                  width={1024}
                  height={768}
                  className={styles.image}
                />
              }
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
