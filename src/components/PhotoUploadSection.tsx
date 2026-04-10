import { X } from "lucide-react";
import type { RefObject } from "react";
import { type Photo } from "../hook/usePhotoUpload";

interface Props {
  title: string;
  photos: Photo[];
  inputRef: RefObject<HTMLInputElement | null>;
  handleButtonClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (id: number) => void;
  max?: number;
}

export function PhotoUploadSection({
  title,
  photos,
  inputRef,
  handleButtonClick,
  handleFileChange,
  removePhoto,
  max = 4,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
          {title}
        </h3>
        <span className="text-[11px] text-[rgba(120,100,80,0.4)]">
          {photos.length}/{max}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-2.5 flex-wrap">
        <button
          onClick={handleButtonClick}
          className="w-[67px] h-[67px] bg-[rgba(220,200,185,0.4)] rounded-lg border-2 border-dashed
            border-[rgba(160,140,120,0.25)] cursor-pointer flex items-center justify-center
            text-2xl text-[rgba(140,120,90,0.4)] hover:bg-[rgba(220,200,185,0.6)]
            hover:border-[rgba(140,120,90,0.35)] transition-all duration-150"
        >
          +
        </button>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="w-[67px] h-[67px] rounded-lg overflow-visible relative shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover rounded-lg border border-[rgba(220,210,195,0.5)]"
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[rgba(80,60,40,0.85)]
                border-2 border-[#faf6ed] flex items-center justify-center
                text-white cursor-pointer transition-all duration-150 hover:bg-[rgba(60,40,20,0.95)]
                shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
