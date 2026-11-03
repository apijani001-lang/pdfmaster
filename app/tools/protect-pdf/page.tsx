
"use client";

import { useRef, useState } from "react";
import {
  LockKeyhole,
  FileText,
  FileUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  RefreshCw,
} from "lucide-react";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";

export default function ProtectPDFPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const handleFile = (selected?: File) => {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selected);
    setError("");
    setSuccess(false);
  };

  const protectPDF = async () => {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!globalThis.crypto?.subtle) {
      setError("Secure encryption requires HTTPS or localhost.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const inputBytes = new Uint8Array(await file.arrayBuffer());

      const encryptedBytes = await encryptPDF(inputBytes, password, {
        ownerPassword: globalThis.crypto.randomUUID() + "Owner!",
        algorithm: "AES-256",
        allowPrinting,
        allowCopying,
        allowModifying,
        allowAnnotating: allowModifying,
        allowFillingForms: allowModifying,
        allowExtraction: allowCopying,
        allowAssembly: allowModifying,
        allowHighQualityPrint: allowPrinting,
      });

      if (
        !(encryptedBytes instanceof Uint8Array) ||
        encryptedBytes.length === 0
      ) {
        throw new Error("Encryption did not produce a valid PDF.");
      }

      const outputBytes = encryptedBytes.slice();
      const outputBlob = new Blob(
        [outputBytes.buffer as ArrayBuffer],
        { type: "application/pdf" }
      );

      const downloadUrl = URL.createObjectURL(outputBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download =
        file.name.replace(/\.pdf$/i, "") + "-protected.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1500);

      setSuccess(true);
    } catch (err) {
      console.error("PDF protection error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not protect this PDF. Please try another file."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#f7f7ff] text-slate-900">

      {/* Hero Section */}
      <section className="relative px-5 pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-200">
            <LockKeyhole size={38} />
          </div>

          <span className="rounded-full border border-indigo-100 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 shadow-sm">
            PDF Security Tool
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            Protect PDF
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
            Add an opening password to your PDF documents and
            keep your important files protected.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-indigo-600" />
              PDF Protection
            </span>
            <span className="flex items-center gap-2">
              <LockKeyhole size={17} className="text-indigo-600" />
              Password Security
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-indigo-600" />
              Browser Processing
            </span>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="px-4 pb-16 md:px-6 md:pb-20">
        <div className="mx-auto w-full max-w-3xl">

          <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-100/50">

            <div className="border-b border-slate-100 px-6 py-7 text-center md:px-10">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Secure Your Document
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Upload your PDF and create an opening password.
              </p>
            </div>

            <div className="p-5 md:p-10">

              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-5 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                    <FileUp size={32} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">
                    Drop your PDF here
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Or select a file from your computer
                  </p>

                  <span className="mt-6 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700">
                    Choose PDF
                  </span>

                  <p className="mt-5 text-xs text-slate-400">
                    PDF files only
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                    <FileText size={27} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">
                      {file.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatSize(file.size)} · PDF Document
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    disabled={loading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl text-slate-400 transition hover:bg-white hover:text-red-500 disabled:opacity-50 sm:self-center"
                    aria-label="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {file && (
                <div className="mt-8 space-y-6">

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      PDF Opening Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                        aria-label="Show or hide password"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Minimum 6 characters.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Confirm Password
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter the same password again"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Permissions */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                    <div className="mb-5">
                      <h3 className="font-bold text-slate-800">
                        Document Permissions
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose which actions readers may be allowed to perform.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          label: "Allow printing",
                          value: allowPrinting,
                          setter: setAllowPrinting,
                        },
                        {
                          label: "Allow copying",
                          value: allowCopying,
                          setter: setAllowCopying,
                        },
                        {
                          label: "Allow modifications",
                          value: allowModifying,
                          setter: setAllowModifying,
                        },
                      ].map((item) => (
                        <label
                          key={item.label}
                          className="flex cursor-pointer items-center justify-between gap-3 border-b border-slate-200 pb-4 last:border-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {item.label}
                          </span>

                          <input
                            type="checkbox"
                            checked={item.value}
                            onChange={(e) => item.setter(e.target.checked)}
                            className="h-5 w-5 cursor-pointer accent-indigo-600"
                          />
                        </label>
                      ))}
                    </div>

                    <p className="mt-5 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">
                      Permission restrictions depend on the PDF reader.
                      The opening password is the main security feature.
                    </p>
                  </div>

                  {/* Protect Button */}
                  <button
                    type="button"
                    onClick={protectPDF}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={19} className="animate-spin" />
                        Encrypting PDF...
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={19} />
                        Protect & Download PDF
                      </>
                    )}
                  </button>

                  {success && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                      <CheckCircle2 size={21} className="shrink-0" />
                      Protected PDF downloaded successfully.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={reset}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                  >
                    Start Again
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "PDF Security",
                desc: "Add an opening password",
              },
              {
                icon: LockKeyhole,
                title: "Private",
                desc: "Browser-based processing",
              },
              {
                icon: FileText,
                title: "Simple",
                desc: "Easy upload and download",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-indigo-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <item.icon
                  size={27}
                  className="mx-auto mb-3 text-indigo-600"
                />
                <h3 className="font-bold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-indigo-100 bg-white px-5 py-16 md:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Simple Process
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              How to Protect a PDF
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Protect your document in three simple steps.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Upload PDF", "Choose the PDF document you want to protect."],
              ["02", "Create Password", "Enter and confirm your opening password."],
              ["03", "Download", "Save your newly encrypted PDF document."],
            ].map(([number, title, description]) => (
              <div key={number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-200">
                  {number}
                </div>

                <h3 className="mt-5 font-bold text-slate-800">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="bg-[#f7f7ff] px-5 py-12 md:py-16">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3 className="font-bold text-amber-900">
                Important Security Notice
              </h3>

              <p className="mt-2 text-sm leading-7 text-amber-800">
                Keep your opening password safe. Without it, you may not
                be able to access your document. Permission restrictions
                are separate from password protection. Always test the
                downloaded PDF before relying on its protection.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
