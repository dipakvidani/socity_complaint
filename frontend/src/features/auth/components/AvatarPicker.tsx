import { ChangeEvent, SyntheticEvent, useMemo, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import ReactCrop, { centerCrop, makeAspectCrop, PercentCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import toast from "react-hot-toast";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Button from "../../../components/Button/Button";
import { checkImage } from "../../../utils/validation";

interface AvatarPickerProps {
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
  onRemovePhoto?: () => void;
  removingPhoto?: boolean;
}

export default function AvatarPicker({ file, currentUrl, onChange, onRemovePhoto, removingPhoto }: AvatarPickerProps) {
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
        toast.success("Photo ready. Click 'Save photo' to finish.");
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-1">
      {/* Avatar Container with Hover Overlay & Badge */}
      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Choose profile photo"
          className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 transition-all duration-200 group-hover:border-indigo-500 group-hover:shadow-md"
        >
          {preview ? (
            <img src={preview} alt="Your profile avatar" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <PhotoCameraOutlinedIcon className="text-slate-400 group-hover:text-indigo-500 transition-colors" style={{ fontSize: 36 }} />
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <PhotoCameraOutlinedIcon style={{ fontSize: 22 }} />
            <span className="text-[10px] font-medium mt-0.5">Change</span>
          </div>
        </button>

        {/* Small Camera Badge */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Upload new photo"
          className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md border-2 border-white dark:border-slate-900 hover:bg-indigo-700 transition-colors"
        >
          <PhotoCameraOutlinedIcon style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Info & Action Buttons */}
      <div className="flex flex-col gap-2 min-w-0">
        <div>
          <h3 className="text-body font-semibold text-ink">{currentUrl !== undefined ? "Profile Avatar" : "Profile Avatar (optional)"}</h3>
          <p className="text-caption text-mute mt-0.5">JPG, PNG or WEBP formats up to 2 MB. Square cropped for optimum display.</p>
        </div>

        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            className="!py-1.5 !px-3 text-caption flex items-center gap-1.5"
          >
            <FileUploadOutlinedIcon style={{ fontSize: 16 }} />
            <span>Upload Photo</span>
          </Button>

          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="cursor-pointer text-caption font-medium text-amber-600 dark:text-amber-400 hover:underline px-2 py-1"
            >
              Reset Selection
            </button>
          )}

          {!file && currentUrl && onRemovePhoto && (
            <Button
              type="button"
              variant="secondary"
              loading={removingPhoto}
              onClick={onRemovePhoto}
              className="!py-1.5 !px-3 text-caption text-rose-600 dark:text-rose-400 hover:!bg-rose-50 dark:hover:!bg-rose-950/30 flex items-center gap-1.5"
            >
              <DeleteOutlinedIcon style={{ fontSize: 16 }} />
              <span>Remove Photo</span>
            </Button>
          )}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />

      {/* Image Crop Dialog */}
      <Dialog open={!!source} onClose={() => setSource(null)} maxWidth="xs" fullWidth className="backdrop-blur-sm">
        <div className="flex flex-col gap-4 bg-canvas p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-heading font-semibold text-ink">Crop Profile Photo</h2>
            <span className="text-caption text-mute">Adjust framing</span>
          </div>

          <div className="flex justify-center py-2 bg-slate-900/5 dark:bg-slate-900/40 rounded-xl overflow-hidden">
            <ReactCrop crop={crop} onChange={(_, percent) => setCrop(percent)} onComplete={(c) => setPixelCrop(c)} aspect={1} circularCrop>
              {source && <img ref={imgRef} src={source} alt="Crop preview" onLoad={onLoad} className="max-h-72 object-contain" />}
            </ReactCrop>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-caption text-mute hidden sm:block">Drag circle to adjust position</p>
            <div className="flex justify-end gap-2 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => setSource(null)}>
                Cancel
              </Button>
              <Button onClick={apply}>Apply Crop</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
