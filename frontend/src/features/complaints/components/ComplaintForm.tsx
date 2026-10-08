import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import toast from "../../../utils/toast";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseIcon from "@mui/icons-material/Close";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import Button from "../../../components/Button/Button";
import { SelectField, TextAreaField, TextField } from "../../../components/Field/Field";
import { getErrorMessage, getFieldErrors } from "../../../config/api";
import type { Complaint } from "../../../types";
import { CATEGORIES, PRIORITIES } from "../../../utils/constants";
import { checkImage, complaintSchema, ComplaintValues, filters, LIMITS } from "../../../utils/validation";
import { complaintService } from "../services/complaintService";

interface ComplaintFormProps {
  initialData?: Complaint | null;
  onDone: (complaint: Complaint) => void;
  onCancel: () => void;
}

export default function ComplaintForm({ initialData, onDone, onCancel }: ComplaintFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors },
  } = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? (undefined as unknown as ComplaintValues["category"]),
      priority: initialData?.priority ?? "medium",
    },
  });
  const descLength = watch("description")?.length ?? 0;

  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : initialData?.imageUrl ?? null), [image, initialData?.imageUrl]);

  const pickImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = checkImage(file);
    if (problem) return toast.error(problem);
    setImage(file);
  };

  const submit = async (values: ComplaintValues) => {
    setBusy(true);
    try {
      const body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, v));
      if (image) body.append("image", image);
      const res = isEditing && initialData
        ? await complaintService.update(initialData.id, body)
        : await complaintService.create(body);
      toast.success(res.message);
      onDone(res.data);
    } catch (error) {
      const fields = getFieldErrors(error);
      if (fields) Object.entries(fields).forEach(([name, message]) => setError(name as keyof ComplaintValues, { message }));
      toast.error(getErrorMessage(error, isEditing ? "We could not update your complaint. Please try again." : "We could not send your complaint. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <div className="flex flex-col gap-4">
          <TextField label="Title" placeholder="Water leaking from the ceiling" maxLength={LIMITS.title} filter={filters.title} error={errors.title?.message} {...register("title")} />
          <TextAreaField
            label="What happened?"
            placeholder="Tell us where it is and when it started"
            maxLength={LIMITS.description}
            filter={filters.text}
            hint={`${descLength}/${LIMITS.description}`}
            error={errors.description?.message}
            rows={6}
            {...register("description")}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-2">
            <SelectField label="Category" placeholder="Choose one" options={CATEGORIES} error={errors.category?.message} name="category" control={control} />
            <SelectField label="Priority" options={PRIORITIES} error={errors.priority?.message} name="priority" control={control} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-small font-semibold text-ink">Attach Photo (optional)</span>

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 transition-all cursor-pointer group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 transition-colors">
                  <ImageOutlinedIcon fontSize="medium" />
                </div>
                <p className="mt-2 text-small font-semibold text-ink group-hover:text-indigo-600 transition-colors">
                  Click to upload a photo
                </p>
                <p className="text-caption text-mute mt-0.5">JPG, PNG or WEBP, up to 2 MB</p>
              </button>
            ) : (
              <div className="relative group flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                {/* Image Thumbnail with Hover Zoom */}
                <div
                  onClick={() => setPreviewOpen(true)}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer group/thumb"
                >
                  <img
                    src={imagePreview}
                    alt="Complaint photo preview"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100">
                    <RemoveRedEyeOutlinedIcon className="!text-[18px]" />
                  </div>
                </div>

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-small font-semibold text-ink truncate">{image?.name}</p>
                  <p className="text-caption text-mute mt-0.5">
                    {image?.size ? (image.size / (1024 * 1024)).toFixed(2) + " MB" : "Selected photo"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="text-caption font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RemoveRedEyeOutlinedIcon className="!text-[14px]" />
                      <span>Preview</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-caption font-semibold text-mute hover:text-ink cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Remove Photo Button */}
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  title="Remove photo"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <CloseIcon className="!text-[18px]" />
                </button>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickImage} />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {isEditing ? "Save Changes" : "Send Complaint"}
        </Button>
      </div>

      {/* Image Preview Lightbox Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        className="backdrop-blur-sm"
        slotProps={{
          paper: {
            sx: {
              overflow: "hidden",
              borderRadius: "24px",
              maxHeight: "85vh",
              backgroundImage: "none",
              m: 2,
            },
          },
        }}
      >
        <div className="flex flex-col gap-3 bg-canvas p-4 sm:p-6 rounded-2xl max-w-xl overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h3 className="text-heading font-semibold text-ink">Photo Preview</h3>
              {image?.name && <p className="text-caption text-mute truncate max-w-xs">{image.name}</p>}
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <CloseIcon className="!text-[18px]" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-950 rounded-xl overflow-hidden p-2 min-h-48">
            {imagePreview && (
              <img src={imagePreview} alt="Full complaint photo preview" className="max-h-[65vh] sm:max-h-[70vh] max-w-full w-auto object-contain rounded-lg shrink-0" />
            )}
          </div>
        </div>
      </Dialog>
    </form>
  );
}
