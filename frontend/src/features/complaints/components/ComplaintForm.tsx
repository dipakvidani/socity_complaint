import { ChangeEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "../../../utils/toast";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import Button from "../../../components/Button/Button";
import { SelectField, TextAreaField, TextField } from "../../../components/Field/Field";
import TruncatedText from "../../../components/TruncatedText/TruncatedText";
import { getErrorMessage, getFieldErrors } from "../../../config/api";
import type { Complaint } from "../../../types";
import { CATEGORIES, PRIORITIES } from "../../../utils/constants";
import { checkImage, complaintSchema, ComplaintValues, filters, LIMITS } from "../../../utils/validation";
import { complaintService } from "../services/complaintService";

interface ComplaintFormProps {
  onDone: (complaint: Complaint) => void;
  onCancel: () => void;
}

export default function ComplaintForm({ onDone, onCancel }: ComplaintFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { title: "", description: "", priority: "medium" },
  });
  const descLength = watch("description")?.length ?? 0;

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
      const res = await complaintService.create(body);
      toast.success(res.message);
      onDone(res.data);
    } catch (error) {
      const fields = getFieldErrors(error);
      if (fields) Object.entries(fields).forEach(([name, message]) => setError(name as keyof ComplaintValues, { message }));
      toast.error(getErrorMessage(error, "We could not send your complaint. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
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
        <SelectField label="Category" placeholder="Choose one" options={CATEGORIES} error={errors.category?.message} {...register("category")} />
        <SelectField label="Priority" options={PRIORITIES} error={errors.priority?.message} {...register("priority")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-small font-semibold text-ink">Photo (optional)</span>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <ImageOutlinedIcon fontSize="small" /> {image ? "Change photo" : "Add photo"}
          </Button>
          {image && (
            <>
              <div className="min-w-0 flex-1 text-small text-mute">
                <TruncatedText text={image.name} />
              </div>
              <button type="button" onClick={() => setImage(null)} className="cursor-pointer text-caption font-semibold text-ink underline">
                Remove
              </button>
            </>
          )}
        </div>
        <p className="text-caption text-mute">JPG, PNG or WEBP, up to 2 MB.</p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickImage} />
      </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          Send complaint
        </Button>
      </div>
    </form>
  );
}
