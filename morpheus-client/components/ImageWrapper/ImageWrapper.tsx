import { ReactNode } from "react";

type Props = {
  child: ReactNode;
};

const ImageWrapper = (props: Props) => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {props.child}
    </div>
  );
};

export default ImageWrapper;
