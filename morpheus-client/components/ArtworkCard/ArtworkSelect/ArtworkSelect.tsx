
interface ImageSelectProps {
  selected: boolean;
  handleSelect: (value: any) => any;
}

const ArtworkSelect = (props: ImageSelectProps) => {
  return props.selected ? (
    <div onClick={props.handleSelect} className="w-[30px] h-[30px] absolute top-[2px] left-[2px] rounded-full bg-white border border-[#B3005E] flex justify-center items-center z-10">
      <span className="material-icons">check</span>
    </div>
  ) : null;
};

export default ArtworkSelect;
