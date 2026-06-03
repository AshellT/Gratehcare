import Badge from "@/components/dashboard/Badge";
import PageHeader from "@/components/dashboard/PageHeader";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Download,
  Eye,
  File,
  FileCheck,
  FileText,
  Image,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { documentsApi } from "@/lib/api/documents";
import { useActionQuery } from "@/hooks/useActionQuery";
import { useToast } from "@/context/ToastContext";
import type { Document } from "@/lib/api/types";

// ─── Types ──────────────────────────────────────────────────────────────────

type DocStatus = "uploading" | "ready" | "error";

interface DocumentRecord {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
  /** Presigned or object URL for preview */
  previewUrl?: string;
}

const mapDocument = (doc: Document): DocumentRecord => ({
  id: doc.id,
  name: doc.name,
  mimeType: doc.mimeType,
  sizeBytes: doc.sizeBytes,
  status: doc.status,
  uploadedAt: doc.createdAt || new Date().toISOString(),
  uploadedBy: doc.uploadedBy,
  previewUrl: doc.previewUrl,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function DocIcon({ mime }: { mime: string }) {
  if (mime === "application/pdf")
    return <FileText className="h-5 w-5 text-rose-500" />;
  if (mime.startsWith("image/"))
    return <Image className="h-5 w-5 text-sky-500" />;
  return <File className="h-5 w-5 text-slate-400" />;
}

async function uploadFile(
  file: File,
): Promise<{ id: string; previewUrl?: string }> {
  const uploaded = await documentsApi.upload(file);
  const preview = await documentsApi.getPreviewUrl(uploaded.id);
  return {
    id: uploaded.id,
    previewUrl:
      preview.url ||
      uploaded.previewUrl ||
      (file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined),
  };
}

// ─── Preview modal ────────────────────────────────────────────────────────

const PreviewModal: React.FC<{ doc: DocumentRecord; onClose: () => void }> = ({
  doc,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.16 }}
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <DocIcon mime={doc.mimeType} />
          <span className="text-sm font-semibold text-slate-900 truncate">
            {doc.name}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatBytes(doc.sizeBytes)}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-50">
        {doc.mimeType.startsWith("image/") && doc.previewUrl ? (
          <img
            src={doc.previewUrl}
            alt={doc.name}
            className="max-w-full max-h-full rounded-xl shadow"
          />
        ) : doc.mimeType === "application/pdf" && doc.previewUrl ? (
          <iframe
            src={doc.previewUrl}
            title={doc.name}
            className="w-full h-full min-h-[60vh] rounded-lg border border-slate-200"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <DocIcon mime={doc.mimeType} />
            <p className="text-sm font-medium">
              Preview not available for this file type.
            </p>
            <a
              href={doc.previewUrl ?? "#"}
              download={doc.name}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download file
            </a>
          </div>
        )}
      </div>
    </motion.div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────

const DocumentsPage: React.FC = () => {
  const toast = useToast();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<DocumentRecord | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useActionQuery("upload", () => fileInputRef.current?.click());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await documentsApi.list();
        if (!mounted) return;
        setDocs((res.data ?? []).map(mapDocument));
      } catch {
        if (mounted) {
          toast.error("Failed to load documents", "Could not fetch documents from backend.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const processFile = useCallback(async (file: File) => {
    setUploadError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setUploadError(
        `Unsupported file type: ${file.type}. Allowed: PDF, JPEG, PNG, WEBP, DOC, DOCX.`,
      );
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(
        `File too large (max 20 MB). This file is ${formatBytes(file.size)}.`,
      );
      return;
    }

    const placeholder: DocumentRecord = {
      id: `uploading-${Date.now()}`,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      status: "uploading",
      uploadedAt: new Date().toISOString(),
      uploadedBy: "You",
    };

    setDocs((prev) => [placeholder, ...prev]);

    try {
      const result = await uploadFile(file);
      setDocs((prev) =>
        prev.map((d) =>
          d.id === placeholder.id
            ? {
                ...d,
                id: result.id,
                status: "ready",
                previewUrl: result.previewUrl,
              }
            : d,
        ),
      );
    } catch {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === placeholder.id ? { ...d, status: "error" } : d,
        ),
      );
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const openPreview = async (doc: DocumentRecord) => {
    try {
      const preview = await documentsApi.getPreviewUrl(doc.id);
      setPreview({ ...doc, previewUrl: preview.url || doc.previewUrl });
    } catch {
      toast.error("Preview failed", "Could not fetch the document preview URL.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Document Library"
        description="Upload, preview and manage client and organisational documents."
      />

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-12 cursor-pointer transition-colors select-none ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <Upload className="h-6 w-6 text-indigo-600" />
        </span>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            {dragOver ? "Drop to upload" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, JPEG, PNG, WEBP, DOC, DOCX · max 20 MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          onChange={onFileInput}
        />
      </div>

      {/* Upload error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-rose-500 hover:text-rose-700"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">All documents</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {docs.length} file{docs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading documents...</div>
        ) : docs.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-400 font-medium">
            No documents yet. Upload your first file above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <span className="flex-shrink-0">
                  {doc.status === "uploading" ? (
                    <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                  ) : doc.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                  ) : (
                    <DocIcon mime={doc.mimeType} />
                  )}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {doc.name}
                    </span>
                    {doc.status === "uploading" && (
                      <Badge tone="indigo">Uploading…</Badge>
                    )}
                    {doc.status === "error" && (
                      <Badge tone="rose">Failed</Badge>
                    )}
                    {doc.status === "ready" && (
                      <Badge tone="emerald">
                        <FileCheck className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span>{formatBytes(doc.sizeBytes)}</span>
                    <span>·</span>
                    <span>by {doc.uploadedBy}</span>
                    <span>·</span>
                    <span>{timeAgo(doc.uploadedAt)}</span>
                  </div>
                </div>

                {doc.status === "ready" && (
                  <button
                    onClick={() => void openPreview(doc)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal doc={preview} onClose={() => setPreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
