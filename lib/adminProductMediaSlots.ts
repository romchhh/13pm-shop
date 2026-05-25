/** Єдиний список медіа в адмінці (існуючі + нові файли) зі збереженням порядку. */

export type ProductMediaSlot =
  | { key: string; kind: "existing"; type: string; url: string }
  | {
      key: string;
      kind: "new";
      type: "photo" | "video";
      file: File;
      preview: string;
    };

function newSlotKey(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function slotsFromExisting(
  media: { type: string; url: string }[]
): ProductMediaSlot[] {
  return media.map((m, i) => ({
    key: `ex-${m.url}-${i}`,
    kind: "existing" as const,
    type: m.type,
    url: m.url,
  }));
}

export function detectMediaFileType(file: File): "photo" | "video" {
  const isVideo =
    file.type.startsWith("video/") ||
    [".webm", ".mp4", ".mov", ".avi", ".mkv"].some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
  return isVideo ? "video" : "photo";
}

export function appendFilesToSlots(
  slots: ProductMediaSlot[],
  files: File[]
): ProductMediaSlot[] {
  const added: ProductMediaSlot[] = files.map((file) => ({
    key: newSlotKey("new"),
    kind: "new" as const,
    type: detectMediaFileType(file),
    file,
    preview: URL.createObjectURL(file),
  }));
  return [...slots, ...added];
}

export function removeSlotAt(slots: ProductMediaSlot[], index: number): ProductMediaSlot[] {
  const slot = slots[index];
  if (slot?.kind === "new" && slot.preview) {
    URL.revokeObjectURL(slot.preview);
  }
  return slots.filter((_, i) => i !== index);
}

export function revokeNewSlotPreviews(slots: ProductMediaSlot[]): void {
  for (const s of slots) {
    if (s.kind === "new" && s.preview) URL.revokeObjectURL(s.preview);
  }
}

/** Завантажити нові файли та зібрати масив media у порядку слотів. */
export async function resolveSlotsToMedia(
  slots: ProductMediaSlot[]
): Promise<{ type: "photo" | "video"; url: string }[]> {
  const newSlots = slots.filter(
    (s): s is Extract<ProductMediaSlot, { kind: "new" }> => s.kind === "new"
  );

  let uploaded: { type: "photo" | "video"; url: string }[] = [];
  if (newSlots.length > 0) {
    const uploadForm = new FormData();
    newSlots.forEach((s) => uploadForm.append("images", s.file));
    const uploadRes = await fetch("/api/images", { method: "POST", body: uploadForm });
    if (!uploadRes.ok) throw new Error("Не вдалося завантажити файли");
    const uploadData = await uploadRes.json();
    uploaded = uploadData.media || [];
  }

  let uploadIdx = 0;
  return slots.map((slot) => {
    if (slot.kind === "existing") {
      return {
        type: slot.type as "photo" | "video",
        url: slot.url,
      };
    }
    const item = uploaded[uploadIdx++];
    if (!item) throw new Error("Помилка завантаження медіа");
    return item;
  });
}

export function slotPreviewSrc(slot: ProductMediaSlot): string {
  if (slot.kind === "new") return slot.preview;
  return `/api/images/${slot.url}`;
}
