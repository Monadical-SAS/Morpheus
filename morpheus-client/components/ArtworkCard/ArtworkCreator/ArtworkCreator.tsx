import { User } from "@/models/models";

interface ImageCreatorProps {
  creator: User;
}

const ArtworkCreator = (props: ImageCreatorProps) => {
  return (
    <div className="w-auto flex flex-row items-center">
      <img
        src={props.creator?.avatar || "/images/avatar.png"}
        alt="avatar"
        loading="lazy"
        className="w-12 h-12 rounded-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = "/images/avatar.png"; }}
      />
      <div className="ml-4">
        <p className="body-3 secondary">{props.creator.name}</p>
        <p className="body-2 white">{props.creator.email}</p>
      </div>
    </div>
  );
};

export default ArtworkCreator;
