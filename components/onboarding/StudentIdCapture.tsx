"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, RotateCcw, ShieldCheck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface StudentIdCaptureProps {
  userId: string;
  onVerified: () => void;
}

type Stage = "choose" | "camera" | "preview" | "verifying";

export function StudentIdCapture({ userId, onVerified }: StudentIdCaptureProps) {
  const [stage, setStage] = useState<Stage>("choose");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function setSelectedFile(file: File) {
    fileRef.current = file;
    setPreviewUrl(URL.createObjectURL(file));
    setStage("preview");
    setError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image of your UIT student ID.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Student ID image must be smaller than 5MB.");
      return;
    }
    setSelectedFile(file);
  }

  async function openCamera() {
    const cameraInput = cameraInputRef.current;
    const shouldUseNativeCapture =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches &&
      cameraInput;

    if (shouldUseNativeCapture) {
      cameraInput.click();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInput?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setStage("camera");
      setError(null);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      toast.error("Could not access your camera. You can upload your UIT ID photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        setSelectedFile(new File([blob], "student-id.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  }

  function retake() {
    fileRef.current = null;
    setPreviewUrl(null);
    setError(null);
    setStage("choose");
  }

  async function submitForVerification() {
    const file = fileRef.current;
    if (!file) return;

    setStage("verifying");
    setError(null);

    try {
      const supabase = createClient();
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/student-id.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("student-id-photos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("Student ID upload failed", uploadError);
        setError("We could not securely submit your ID photo for school-controlled verification. Please try again.");
        setStage("preview");
        return;
      }

      const response = await fetch("/api/verify-student-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      const result = (await response.json()) as { valid: boolean; reason?: string; error?: string };

      if (!response.ok || !result.valid) {
        setError(
          result.reason ||
            result.error ||
            "We could not confirm this as an official UIT student ID. Please use a clearer photo that shows the UIT name, your photo, and your name.",
        );
        setStage("preview");
        return;
      }

      onVerified();
    } catch (error) {
      console.error("Student ID verification threw", error);
      setError("Something went wrong during official student verification. Please try again.");
      setStage("preview");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {stage === "choose" && (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
              <p>
                Submit the official UIT-issued student ID tied to your own account. This
                school-controlled step keeps student services restricted to verified UIT members.
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
              <p>
                Make sure the UIT name, your name, and your ID photo are visible. Cover unrelated
                details if needed, but do not block those fields.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="touch"
            className="rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
            onClick={openCamera}
          >
            <Camera className="h-4 w-4" />
            Take a photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="touch"
            className="rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload ID photo
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {stage === "camera" && (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground">
            Frame the official card flat in good light so UIT, your name, and your photo are readable.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                stopCamera();
                setStage("choose");
              }}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
              onClick={capturePhoto}
            >
              <Camera className="h-4 w-4" />
              Use photo
            </Button>
          </div>
        </div>
      )}

      {(stage === "preview" || stage === "verifying") && previewUrl && (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Your UIT student ID preview" className="aspect-video w-full object-cover" />
          </div>
          <p className="text-sm text-muted-foreground">
            Only authorized verification reviewers and the secure verification service can use this
            image. It is not shown to tutors, hostel owners, restaurants, or drivers.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={stage === "verifying"}
              onClick={retake}
            >
              <RotateCcw className="h-4 w-4" />
              Choose again
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-brand-indigo hover:bg-brand-indigo-dark"
              disabled={stage === "verifying"}
              onClick={submitForVerification}
            >
              {stage === "verifying" && <Loader2 className="h-4 w-4 animate-spin" />}
              {stage === "verifying" ? "Checking official UIT status..." : "Verify official UIT status"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
