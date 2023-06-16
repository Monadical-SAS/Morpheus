import { capitalize } from "../../utils/strings";
import styles from "./ShareButton.module.scss";

interface ShareOptionProps {
  url: string;
  image: string;
}

const ShareOption = (props: ShareOptionProps) => {
  const handleClick = () => {
    window.open(props.url, "_blank");
  };

  return (
    <img
      className={styles.imgIcon}
      src={`/images/icons/${props.image}.svg`}
      onClick={handleClick}
      alt={`Share to ${capitalize(props.image)}`}
    />
  );
};

interface ShareOptionsProps {
  url: string;
  message: string;
}

const ShareOptions = (props: ShareOptionsProps) => {
  return (
    <div className={styles.shareOptions}>
      <ShareOption
        url={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          props.url
        )}&quote=${encodeURIComponent(props.message)}`}
        image={"facebook"}
      />

      <ShareOption
        url={`https://api.whatsapp.com/send?text=${encodeURIComponent(
          props.message
        )} ${encodeURIComponent(props.url)}`}
        image={"whatsapp"}
      />

      <ShareOption
        url={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          props.message
        )}&url=${encodeURIComponent(props.url)}`}
        image={"twitter"}
      />

      <ShareOption
        url={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          props.url
        )}&title=${encodeURIComponent(props.message)}`}
        image={"linkedin"}
      />

      <ShareOption
        url={`https://www.reddit.com/submit?url=${encodeURIComponent(
          props.url
        )}&title=${encodeURIComponent(props.message)}`}
        image={"reddit"}
      />

      <ShareOption
        url={`https://t.me/share/url?url=${encodeURIComponent(
          props.url
        )}&text=${encodeURIComponent(props.message)}`}
        image={"telegram"}
      />

      <ShareOption
        url={`mailto:?subject=${encodeURIComponent(
          props.message
        )}&body=${encodeURIComponent(props.url)}`}
        image={"email"}
      />

      <ShareOption
        url={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
          props.url
        )}&description=${encodeURIComponent(props.message)}`}
        image={"pinterest"}
      />
    </div>
  );
};

export default ShareOptions;
