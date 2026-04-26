import { useEffect, useRef, useState } from "react";

export type Photo = { id: number; url: string; file: File };

export function usePhotoUpload(max = 4) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => () => {
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const handleButtonClick = () => {
    if (photos.length >= max) {
      alert(`사진은 최대 ${max}장까지 추가할 수 있습니다.`);
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const allowed = files.slice(0, max - photos.length);
    const newPhotos = allowed.map((file, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  };

  const removePhoto = (id: number) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const replacePhotos = (newPhotos: Photo[]) => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return newPhotos;
    });
  };

  return { photos, inputRef, handleButtonClick, handleFileChange, removePhoto, replacePhotos, max };
}
