import { ChangeEvent, SyntheticEvent, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import ReactCrop, { centerCrop, makeAspectCrop, PercentCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import toast from "react-hot-toast";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import Button from "../../../components/Button/Button";
import { checkImage } from "../../../utils/validation";

interface AvatarPickerProps {
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
}

export default function AvatarPicker({ file, currentUrl, onChange }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState<PercentCrop | undefined>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | undefined>();

  const picked = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const preview = picked ?? currentUrl ?? null;

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    const problem = checkImage(picked);
    if (problem) return toast.error(problem);
    setSource(URL.createObjectURL(picked));
  };

  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 80 }, 1, width, height), width, height));
  };

  const apply = () => {
    const img = imgRef.current;
    const context = document.createElement("canvas").getContext("2d");
    if (!img || !context || !pixelCrop?.width) return toast.error("Drag the box over the part of the photo you want to keep.");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const canvas = context.canvas;
    canvas.width = 300;
    canvas.height = 300;
    context.drawImage(img, pixelCrop.x * scaleX, pixelCrop.y * scaleY, pixelCrop.width * scaleX, pixelCrop.height * scaleY, 0, 0, 300, 300);
    canvas.toBlob(
      (blob) => {
        if (!blob) return toast.error("We could not crop that photo. Please try another one.");
        onChange(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
        setSource(null);
        toast.success("Photo ready. It will be saved with your account.");
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Choose profile photo"
        className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-secondary text-mute"
      >
        {preview ? <img src={preview} alt="Your profile" className="h-full w-full object-cover" /> : <PhotoCameraOutlinedIcon />}
      </button>
      <div className="flex flex-col gap-1">
        <p className="text-small font-semibold text-ink">{currentUrl !== undefined ? "Profile photo" : "Profile photo (optional)"}</p>
        <p className="text-caption text-mute">JPG, PNG or WEBP, up to 2 MB.</p>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="w-fit cursor-pointer text-caption font-semibold text-ink underline">
            Remove photo
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />

      <Dialog open={!!source} onClose={() => setSource(null)} maxWidth="xs" fullWidth>
        <div className="flex flex-col gap-4 bg-canvas p-6">
          <h2 className="text-heading font-semibold text-ink">Crop your photo</h2>
          <div className="flex justify-center">
            <ReactCrop crop={crop} onChange={(_, percent) => setCrop(percent)} onComplete={(c) => setPixelCrop(c)} aspect={1} circularCrop>
              {source && <img ref={imgRef} src={source} alt="Crop preview" onLoad={onLoad} className="max-h-72" />}
            </ReactCrop>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSource(null)}>
              Cancel
            </Button>
            <Button onClick={apply}>Use photo</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
