"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { adminCancelRequest, adminResolveRequest } from "@/lib/queries/requests";
import { createClient } from "@/lib/supabase/client";

interface RequestResolutionActionsProps {
  requestId: string;
  requesterName: string;
}

type ActionKind = "resolve" | "cancel";

export function RequestResolutionActions({
  requestId,
  requesterName,
}: RequestResolutionActionsProps) {
  const router = useRouter();
  const [action, setAction] = useState<ActionKind | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<ActionKind | null>(null);

  async function submit() {
    if (!action) return;
    setPending(action);
    try {
      const supabase = createClient();
      if (action === "resolve") {
        await adminResolveRequest(supabase, requestId, note);
        toast.success("Case resolved.");
      } else {
        await adminCancelRequest(supabase, requestId, note);
        toast.success("Case cancelled.");
      }
      setAction(null);
      setNote("");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't update this case.";
      toast.error(message);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          size="touch"
          className="min-h-11 rounded-xl bg-brand-mint text-white hover:bg-brand-mint/90"
          onClick={() => setAction("resolve")}
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolve
        </Button>
        <Button
          variant="outline"
          size="touch"
          className="min-h-11 rounded-xl"
          onClick={() => setAction("cancel")}
        >
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "cancel" ? "Cancel case" : "Resolve case"}</DialogTitle>
            <DialogDescription>
              Add a school-visible note for {requesterName}&apos;s request before closing it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Admin resolution note"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Back
            </Button>
            <Button
              className={action === "cancel" ? undefined : "bg-brand-mint text-white hover:bg-brand-mint/90"}
              variant={action === "cancel" ? "destructive" : "default"}
              disabled={Boolean(pending)}
              aria-busy={Boolean(pending)}
              onClick={submit}
            >
              {action === "cancel" ? "Cancel case" : "Resolve case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
