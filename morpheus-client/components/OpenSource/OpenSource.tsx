import ButtonPrimary from "@/components/buttons/ButtonPrimary/ButtonPrimary";
import { StarIcon } from "@/components/icons/star";

export const OpenSource = () => {
  return (
    <div className="w-full max-w-[280px] h-auto flex flex-col rounded-[18px] border border-white p-6 gap-[14px] !mt-12 max-md:hidden">
      <div className="flex items-center">
        <span className="-translate-x-2">
          <StarIcon />
        </span>
        <p className="font-bold base-1 accent">Morpheus is open source!</p>
      </div>

      <p className="base-1 primary">
        Easily add your own AI models or functionality, extending Morpheus for
        your own project needs.
      </p>

      <ButtonPrimary
        loading={false}
        onClick={() =>
          window.open("https://github.com/Monadical-SAS/Morpheus/fork")
        }
        text={"Fork on GitHub"}
        className="!p-0"
      />
    </div>
  );
};
