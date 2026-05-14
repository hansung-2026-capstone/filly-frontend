import { X } from "lucide-react";
import type { RefObject } from "react";
import { type Photo } from "../hook/usePhotoUpload";

type DisplayPhoto = Pick<Photo, "id" | "url">;

interface PhotoUploadSectionProps {
  title: string;
  photos: DisplayPhoto[];
  inputRef?: RefObject<HTMLInputElement>;
  handleButtonClick?: () => void;
  handleFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto?: (id: number) => void;
  max?: number;
  readOnly?: boolean;
  helperText?: string;
}

export function PhotoUploadSection({
  title,
  photos,
  inputRef,
  handleButtonClick,
  handleFileChange,
  removePhoto,
  max = 4,
  readOnly = false,
  helperText,
}: PhotoUploadSectionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-text-primary tracking-[0.5px] m-0 font-medium">
          {title}
        </h3>
        <span className="text-[12px] text-text-subtle">
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
        {!readOnly && (
          <button
            onClick={handleButtonClick}
            className="w-[67px] h-[67px] bg-bg-upload rounded-lg border-2 border-dashed
              border-border-dashed cursor-pointer flex items-center justify-center
              text-2xl text-[var(--text-upload-plus)] hover:bg-bg-upload-hover
              hover:border-border-dashed-hover transition-all duration-150"
          >
            +
          </button>
        )}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="w-[67px] h-[67px] rounded-lg overflow-visible relative shadow-[var(--shadow-photo)]"
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover rounded-lg border border-border-card"
            />
            {!readOnly && removePhoto && (
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg-strong-control
                  border-2 border-notebook-page flex items-center justify-center
                  text-[var(--text-white-soft)] cursor-pointer transition-all duration-150 hover:bg-bg-strong-control-hover
                  shadow-[var(--shadow-remove-button)]"
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            )}
          </div>
        ))}
      </div>
      {helperText && (
        <p className="text-[12px] text-text-secondary m-0">{helperText}</p>
      )}
    </div>
  );
}
