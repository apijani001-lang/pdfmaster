
"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import JSZip from "jszip";
import {
  FileImage,
  Upload,
  Download,
  Archive,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  ShieldCheck,
  Image as ImageIcon,
  RefreshCw,
    FolderOpen,
  Sparkles,
  Settings2,
  LockKeyhole,
} from "lucide-react";

type ConvertedImage = {
  name: string;
  blob: Blob;
  url: string;
};

export default function PdfToJpgPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [quality, setQuality] = useState(85);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const clearImages = (items: ConvertedImage[]) => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
  };

  useEffect(() => {
    return () => {
      clearImages(images);
    };
    // Cleanup URLs when the page is closed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setError("");
    setSuccess(false);
    clearImages(images);
    setImages([]);
    setProgress("");

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("Please select a valid PDF file.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("The selected PDF file is empty.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    clearImages(images);
    setImages([]);
    setFile(null);
    setError("");
    setSuccess(false);
    setProgress("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    imageQuality: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not create JPG image."));
          }
        },
        "image/jpeg",
        imageQuality
      );
    });
  };

  const convertPdf = async () => {
    if (!file || loading) {
      if (!file) setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    clearImages(images);
    setImages([]);

    const converted: ConvertedImage[] = [];

    try {
      setProgress("Loading PDF document...");

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const bytes = new Uint8Array(await file.arrayBuffer());

      const loadingTask = pdfjs.getDocument({
        data: bytes,
      });

      const pdf = await loadingTask.promise;

      if (pdf.numPages > 100) {
        throw new Error(
          "This converter supports up to 100 pages at a time. Please split your PDF into smaller files."
        );
      }

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setProgress(
          `Converting page ${pageNumber} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = window.document.createElement("canvas");
        const context = canvas.getContext("2d", {
          alpha: false,
        });

        if (!context) {
          throw new Error("Could not create image canvas.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await canvasToBlob(canvas, quality / 100);

        const name = `${file.name.replace(/\.pdf$/i, "")}-page-${String(
          pageNumber
        ).padStart(2, "0")}.jpg`;

        converted.push({
          name,
          blob,
          url: URL.createObjectURL(blob),
        });

        canvas.width = 0;
        canvas.height = 0;
      }

      setImages(converted);
      setSuccess(true);
      setProgress(
        `Successfully converted ${converted.length} page${converted.length === 1 ? "" : "s"}!`
      );
    } catch (err) {
      console.error("PDF to JPG error:", err);

      clearImages(converted);

      setError(
        err instanceof Error
          ? err.message
          : "Conversion failed. Please try another PDF."
      );

      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = window.document.createElement("a");

    link.href = image.url;
    link.download = image.name;

    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadAllZip = async () => {
    if (images.length === 0 || downloadingZip) return;

    setDownloadingZip(true);
    setError("");

    try {
      const zip = new JSZip();

      const folder = zip.folder(
        file
          ? file.name.replace(/\.pdf$/i, "")
          : "PDFMaster-JPG-Images"
      );

      if (!folder) {
        throw new Error("Could not create ZIP folder.");
      }

      images.forEach((image) => {
        folder.file(image.name, image.blob);
      });

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5,
        },
      });

      const url = URL.createObjectURL(zipBlob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = `${
        file ? file.name.replace(/\.pdf$/i, "") : "PDFMaster"
      }-JPG-Images.zip`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("ZIP download error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create ZIP file."
      );
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (!loading) {
      selectFile(event.dataTransfer.files?.[0]);
    }
  };

  const totalSize = images.reduce(
    (total, image) => total + image.blob.size,
    0
  );

  return (
    <main className="pdfjpg-page">
      <div className="pdfjpg-glow pdfjpg-glow-one" />
      <div className="pdfjpg-glow pdfjpg-glow-two" />

      <div className="pdfjpg-container">

        {/* HERO */}
        <header className="pdfjpg-hero">
          <div className="pdfjpg-badge">
            <Sparkles size={15} />
            PDFMASTER PREMIUM TOOL
          </div>

          <h1>
            PDF to <span>JPG</span>
            <br />
            <span className="pdfjpg-heading-second">Converter</span>
          </h1>

          <p>
            Convert every page of your PDF into high-quality JPG images.
            Download individual images or all pages together in one ZIP file.
          </p>

          <div className="pdfjpg-trust">
            <span><ShieldCheck size={16} /> Browser processing</span>
            <span><Zap size={16} /> Fast conversion</span>
            <span><FileImage size={16} /> JPG images</span>
          </div>
        </header>

        {/* CONVERTER */}
        <section className="pdfjpg-workspace">
          <div className="pdfjpg-workspace-heading">
            <div>
              <div className="pdfjpg-small-label">CONVERSION WORKSPACE</div>
              <h2>Upload your PDF</h2>
              <p>Choose a PDF document from your device.</p>
            </div>

            <div className="pdfjpg-heading-icon">
              <FileImage size={28} />
            </div>
          </div>

          {/* UPLOAD */}
          <div
            className={`pdfjpg-dropzone ${
              dragging ? "pdfjpg-drag-active" : ""
            } ${file ? "pdfjpg-has-file" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!loading) inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="pdfjpg-hidden-input"
              disabled={loading}
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="pdfjpg-upload-icon">
              <Upload size={34} />
            </div>

            <h3>
              {dragging
                ? "Drop your PDF here"
                : file
                  ? "Choose another PDF"
                  : "Drag & drop your PDF"}
            </h3>

            <p>Drop your file here or browse your computer</p>

            <span className="pdfjpg-browse-button">
              <FolderOpen size={17} />
              Browse PDF Files
            </span>

            <div className="pdfjpg-format">
              <span>PDF</span>
              <span>Secure browser processing</span>
            </div>
          </div>

          {/* SELECTED FILE */}
          {file && (
            <div className="pdfjpg-selected">
              <div className="pdfjpg-file-icon">
                <FileImage size={26} />
              </div>

              <div className="pdfjpg-file-info">
                <strong>{file.name}</strong>
                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF document
                </span>
              </div>

              <button
                type="button"
                className="pdfjpg-remove"
                onClick={removeFile}
                disabled={loading}
              >
                <X size={17} />
                Remove
              </button>
            </div>
          )}

          {/* SETTINGS */}
          <div className="pdfjpg-settings">
            <div className="pdfjpg-settings-heading">
              <Settings2 size={19} />
              <strong>Image settings</strong>
            </div>

            <div className="pdfjpg-settings-grid">
              <div className="pdfjpg-setting">
                <div className="pdfjpg-setting-top">
                  <label htmlFor="jpg-quality">JPG Quality</label>
                  <strong>{quality}%</strong>
                </div>

                <input
                  id="jpg-quality"
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    setImages((old) => {
                      clearImages(old);
                      return [];
                    });
                    setSuccess(false);
                  }}
                  disabled={loading}
                />

                <p>Higher quality creates larger image files.</p>
              </div>

              <div className="pdfjpg-setting">
                <div className="pdfjpg-setting-top">
                  <label htmlFor="jpg-resolution">Resolution</label>
                  <strong>
                    {scale === 1 ? "Standard" : scale === 1.5 ? "High" : "Very High"}
                  </strong>
                </div>

                <select
                  id="jpg-resolution"
                  value={scale}
                  onChange={(event) => {
                    setScale(Number(event.target.value));
                    setImages((old) => {
                      clearImages(old);
                      return [];
                    });
                    setSuccess(false);
                  }}
                  disabled={loading}
                >
                  <option value="1">Standard</option>
                  <option value="1.5">High</option>
                  <option value="2">Very High</option>
                </select>

                <p>Higher resolution creates larger dimensions.</p>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="pdfjpg-message pdfjpg-error">
              <AlertCircle size={21} />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="pdfjpg-message pdfjpg-success">
              <CheckCircle2 size={21} />
              <span>{progress}</span>
            </div>
          )}

          {/* PROGRESS */}
          {loading && (
            <div className="pdfjpg-progress">
              <div className="pdfjpg-progress-title">
                <RefreshCw size={18} className="pdfjpg-spin" />
                <span>{progress}</span>
              </div>

              <div className="pdfjpg-progress-track">
                <div className="pdfjpg-progress-bar" />
              </div>

              <p>Please keep this tab open while your PDF is converting.</p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pdfjpg-actions">
            <button
              type="button"
              className="pdfjpg-convert-button"
              onClick={convertPdf}
              disabled={!file || loading}
            >
              {loading ? (
                <RefreshCw size={20} className="pdfjpg-spin" />
              ) : (
                <Zap size={20} />
              )}
              {loading ? "Converting..." : "Convert PDF to JPG"}
            </button>

            <button
              type="button"
              className="pdfjpg-zip-button"
              onClick={downloadAllZip}
              disabled={images.length === 0 || downloadingZip}
            >
              {downloadingZip ? (
                <RefreshCw size={20} className="pdfjpg-spin" />
              ) : (
                <Archive size={20} />
              )}
              {downloadingZip ? "Creating ZIP..." : "Download All ZIP"}
            </button>
          </div>

          <div className="pdfjpg-workspace-footer">
            <LockKeyhole size={14} />
            Your PDF is processed locally in your browser.
          </div>
        </section>

        {/* RESULTS */}
        {images.length > 0 && (
          <section className="pdfjpg-results">
            <div className="pdfjpg-results-heading">
              <div>
                <div className="pdfjpg-small-label">CONVERSION COMPLETE</div>
                <h2>Your JPG Images</h2>
                <p>
                  {images.length} images · {(totalSize / (1024 * 1024)).toFixed(2)} MB total
                </p>
              </div>

              <div className="pdfjpg-result-count">
                <CheckCircle2 size={17} />
                Ready
              </div>
            </div>

            <div className="pdfjpg-images-grid">
              {images.map((image, index) => (
                <article className="pdfjpg-image-card" key={image.name}>
                  <div className="pdfjpg-preview">
                    <img
                      src={image.url}
                      alt={`PDF page ${index + 1}`}
                    />
                    <span>PAGE {index + 1}</span>
                  </div>

                  <div className="pdfjpg-image-info">
                    <div>
                      <strong>Page {index + 1}</strong>
                      <span>
                        {(image.blob.size / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadImage(image)}
                      aria-label={`Download page ${index + 1}`}
                      title="Download JPG"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="pdfjpg-final-download"
              onClick={downloadAllZip}
              disabled={downloadingZip}
            >
              <Archive size={20} />
              {downloadingZip ? "Preparing ZIP..." : "Download All Images as ZIP"}
              <Download size={19} />
            </button>
          </section>
        )}

        {/* FEATURES */}
        <section className="pdfjpg-features-section">
          <div className="pdfjpg-section-heading">
            <div className="pdfjpg-small-label">WHY PDFMASTER?</div>
            <h2>Powerful PDF to JPG conversion</h2>
            <p>Everything you need to turn PDF pages into images.</p>
          </div>

          <div className="pdfjpg-features-grid">
            <article className="pdfjpg-feature-card">
              <div className="pdfjpg-feature-icon feature-blue">
                <ImageIcon size={25} />
              </div>
              <h3>High Quality Images</h3>
              <p>
                Choose JPG quality and resolution to suit your needs.
              </p>
            </article>

            <article className="pdfjpg-feature-card">
              <div className="pdfjpg-feature-icon feature-purple">
                <Archive size={25} />
              </div>
              <h3>ZIP Download</h3>
              <p>
                Download every converted page together in one ZIP file.
              </p>
            </article>

            <article className="pdfjpg-feature-card">
              <div className="pdfjpg-feature-icon feature-green">
                <ShieldCheck size={25} />
              </div>
              <h3>Browser Processing</h3>
              <p>
                Your PDF pages are converted directly in your browser.
              </p>
            </article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="pdfjpg-steps-section">
          <div className="pdfjpg-section-heading">
            <div className="pdfjpg-small-label">THREE SIMPLE STEPS</div>
            <h2>How to convert PDF to JPG</h2>
            <p>Get your images in just a few steps.</p>
          </div>

          <div className="pdfjpg-steps-grid">
            <article className="pdfjpg-step">
              <div className="pdfjpg-step-number">01</div>
              <div>
                <h3>Upload PDF</h3>
                <p>Choose a PDF document from your computer.</p>
              </div>
            </article>

            <article className="pdfjpg-step">
              <div className="pdfjpg-step-number">02</div>
              <div>
                <h3>Convert Pages</h3>
                <p>Each PDF page becomes a separate JPG image.</p>
              </div>
            </article>

            <article className="pdfjpg-step">
              <div className="pdfjpg-step-number">03</div>
              <div>
                <h3>Download Images</h3>
                <p>Download individual JPGs or all images as ZIP.</p>
              </div>
            </article>
          </div>
        </section>

        {/* NOTICE */}
        <div className="pdfjpg-notice">
          <AlertCircle size={20} />
          <p>
            <strong>Note:</strong> This converter creates JPG images of PDF
            pages. It does not extract editable text. Large PDFs and high
            resolution settings may require more memory and processing time.
          </p>
        </div>
      </div>

      {/* PAGE-SCOPED STYLING */}
      <style jsx global>{`
        .pdfjpg-page {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          padding: 75px 20px 100px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.16), transparent 42%),
            linear-gradient(180deg, #080d1b 0%, #0b1020 50%, #080d1b 100%);
          color: #f8fafc;
          font-family: inherit;
        }

        .pdfjpg-page *,
        .pdfjpg-page *::before,
        .pdfjpg-page *::after {
          box-sizing: border-box;
        }

        .pdfjpg-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .pdfjpg-glow {
          position: absolute;
          z-index: 0;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.13;
          pointer-events: none;
        }

        .pdfjpg-glow-one {
          top: 300px;
          left: -200px;
          background: #2563eb;
        }

        .pdfjpg-glow-two {
          top: 850px;
          right: -200px;
          background: #9333ea;
        }

        .pdfjpg-hero {
          width: 100%;
          text-align: center;
          margin: 0 auto 48px;
        }

        .pdfjpg-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 9px 16px;
          border: 1px solid rgba(96, 165, 250, 0.25);
          border-radius: 50px;
          background: rgba(37, 99, 235, 0.12);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          margin-bottom: 24px;
        }

        .pdfjpg-hero h1 {
          margin: 0;
          color: #f8fafc;
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -3.5px;
        }

        .pdfjpg-hero h1 > span:first-child {
          background: linear-gradient(100deg, #60a5fa, #818cf8, #c084fc);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .pdfjpg-hero h1 .pdfjpg-heading-second {
          color: #f8fafc;
          background: none;
          -webkit-text-fill-color: #f8fafc;
        }

        .pdfjpg-hero > p {
          max-width: 660px;
          margin: 22px auto 24px;
          color: #a5b4cf;
          font-size: 16px;
          line-height: 1.85;
        }

        .pdfjpg-trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px 26px;
          color: #94a3b8;
          font-size: 12px;
        }

        .pdfjpg-trust span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .pdfjpg-trust svg {
          color: #60a5fa;
        }

        .pdfjpg-workspace {
          width: 100%;
          padding: 30px;
          border: 1px solid rgba(148, 163, 184, 0.17);
          border-radius: 25px;
          background: linear-gradient(145deg, rgba(22, 34, 58, 0.97), rgba(13, 22, 40, 0.98));
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.28);
        }

        .pdfjpg-workspace-heading,
        .pdfjpg-results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 23px;
        }

        .pdfjpg-small-label {
          color: #60a5fa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .pdfjpg-workspace-heading h2,
        .pdfjpg-results-heading h2 {
          margin: 8px 0 5px;
          color: #f8fafc;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .pdfjpg-workspace-heading p,
        .pdfjpg-results-heading p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .pdfjpg-heading-icon {
          display: flex;
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 16px;
          background: rgba(37, 99, 235, 0.13);
          color: #60a5fa;
        }

        .pdfjpg-dropzone {
          display: flex;
          min-height: 270px;
          width: 100%;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 18px;
          border: 2px dashed #354766;
          border-radius: 19px;
          background: rgba(5, 12, 27, 0.55);
          text-align: center;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }

        .pdfjpg-dropzone:hover,
        .pdfjpg-drag-active {
          border-color: #60a5fa;
          background: rgba(37, 99, 235, 0.08);
        }

        .pdfjpg-drag-active {
          transform: scale(0.995);
        }

        .pdfjpg-has-file {
          border-color: rgba(96, 165, 250, 0.5);
        }

        .pdfjpg-hidden-input {
          display: none;
        }

        .pdfjpg-upload-icon {
          display: flex;
          width: 72px;
          height: 72px;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 21px;
          background: linear-gradient(145deg, rgba(37, 99, 235, 0.25), rgba(99, 102, 241, 0.12));
          color: #60a5fa;
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.13);
        }

        .pdfjpg-dropzone h3 {
          margin: 0 0 9px;
          color: #f8fafc;
          font-size: 20px;
          font-weight: 800;
        }

        .pdfjpg-dropzone p {
          margin: 0 0 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        .pdfjpg-browse-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 22px;
          border-radius: 11px;
          background: linear-gradient(100deg, #2563eb, #6366f1);
          color: white;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.24);
        }

        .pdfjpg-format {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 18px;
          color: #64748b;
          font-size: 11px;
        }

        .pdfjpg-format span:first-child {
          padding: 4px 9px;
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 6px;
          background: rgba(37, 99, 235, 0.1);
          color: #93c5fd;
          font-weight: 800;
        }

        .pdfjpg-selected {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 18px;
          padding: 16px;
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 15px;
          background: rgba(5, 12, 27, 0.6);
        }

        .pdfjpg-file-icon {
          display: flex;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.16);
          color: #60a5fa;
        }

        .pdfjpg-file-info {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          gap: 6px;
        }

        .pdfjpg-file-info strong {
          overflow-wrap: anywhere;
          color: #e2e8f0;
          font-size: 13px;
        }

        .pdfjpg-file-info span {
          color: #94a3b8;
          font-size: 11px;
        }

        .pdfjpg-remove {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: 1px solid rgba(248, 113, 113, 0.22);
          border-radius: 9px;
          background: rgba(239, 68, 68, 0.07);
          color: #fca5a5;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .pdfjpg-settings {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 15px;
          background: rgba(5, 12, 27, 0.42);
        }

        .pdfjpg-settings-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          color: #dbeafe;
          font-size: 14px;
        }

        .pdfjpg-settings-heading svg {
          color: #60a5fa;
        }

        .pdfjpg-settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .pdfjpg-setting-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 13px;
        }

        .pdfjpg-setting-top label {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
        }

        .pdfjpg-setting-top strong {
          color: #93c5fd;
          font-size: 12px;
        }

        .pdfjpg-setting input[type="range"] {
          width: 100%;
          accent-color: #60a5fa;
          cursor: pointer;
        }

        .pdfjpg-setting select {
          width: 100%;
          height: 39px;
          padding: 0 10px;
          border: 1px solid #354766;
          border-radius: 8px;
          background: #111d32;
          color: #e2e8f0;
          outline: none;
        }

        .pdfjpg-setting p {
          margin: 9px 0 0;
          color: #71829d;
          font-size: 11px;
          line-height: 1.6;
        }

        .pdfjpg-message {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.6;
        }

        .pdfjpg-error {
          border: 1px solid rgba(248, 113, 113, 0.3);
          background: rgba(239, 68, 68, 0.09);
          color: #fca5a5;
        }

        .pdfjpg-success {
          border: 1px solid rgba(74, 222, 128, 0.25);
          background: rgba(34, 197, 94, 0.08);
          color: #86efac;
        }

        .pdfjpg-message svg {
          flex-shrink: 0;
        }

        .pdfjpg-progress {
          margin-top: 20px;
          padding: 17px;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 13px;
          background: rgba(37, 99, 235, 0.07);
        }

        .pdfjpg-progress-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #bfdbfe;
          font-size: 13px;
          font-weight: 700;
        }

        .pdfjpg-progress-track {
          height: 7px;
          overflow: hidden;
          margin-top: 14px;
          border-radius: 50px;
          background: #25334d;
        }

        .pdfjpg-progress-bar {
          width: 65%;
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(90deg, #2563eb, #818cf8, #c084fc);
          animation: pdfjpg-loading 1.8s ease-in-out infinite alternate;
        }

        .pdfjpg-progress p {
          margin: 10px 0 0;
          color: #8293ad;
          font-size: 11px;
          line-height: 1.6;
        }

        .pdfjpg-spin {
          animation: pdfjpg-rotate 1s linear infinite;
        }

        @keyframes pdfjpg-rotate {
          to { transform: rotate(360deg); }
        }

        @keyframes pdfjpg-loading {
          from { width: 30%; }
          to { width: 95%; }
        }

        .pdfjpg-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-top: 23px;
        }

        .pdfjpg-actions button {
          display: inline-flex;
          min-height: 56px;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }

        .pdfjpg-actions button:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .pdfjpg-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.38;
        }

        .pdfjpg-convert-button {
          border: 1px solid #477df5;
          background: linear-gradient(105deg, #2563eb, #6366f1);
          color: white;
          box-shadow: 0 9px 25px rgba(37, 99, 235, 0.2);
        }

        .pdfjpg-zip-button {
          border: 1px solid rgba(74, 222, 128, 0.35);
          background: rgba(34, 197, 94, 0.09);
          color: #86efac;
        }

        .pdfjpg-actions button:disabled {
          opacity: 0.4;
        }

        .pdfjpg-workspace-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 18px;
          color: #71829d;
          font-size: 11px;
        }

        .pdfjpg-workspace-footer svg {
          color: #4ade80;
        }

        .pdfjpg-results {
          margin-top: 55px;
          padding: 28px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 23px;
          background: rgba(15, 25, 44, 0.9);
        }

        .pdfjpg-result-count {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid rgba(74, 222, 128, 0.24);
          border-radius: 30px;
          background: rgba(34, 197, 94, 0.08);
          color: #86efac;
          font-size: 12px;
          font-weight: 700;
        }

        .pdfjpg-images-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pdfjpg-image-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 15px;
          background: #0b1426;
        }

        .pdfjpg-preview {
          position: relative;
          display: flex;
          height: 220px;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: #e2e8f0;
        }

        .pdfjpg-preview img {
          display: block;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.18);
        }

        .pdfjpg-preview > span {
          position: absolute;
          bottom: 10px;
          left: 10px;
          padding: 5px 8px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.85);
          color: white;
          font-size: 10px;
          font-weight: 800;
        }

        .pdfjpg-image-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 13px;
        }

        .pdfjpg-image-info > div {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 5px;
        }

        .pdfjpg-image-info strong {
          color: #e2e8f0;
          font-size: 12px;
        }

        .pdfjpg-image-info span {
          color: #94a3b8;
          font-size: 10px;
        }

        .pdfjpg-image-info button {
          display: flex;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: 9px;
          background: rgba(37, 99, 235, 0.14);
          color: #93c5fd;
          cursor: pointer;
        }

        .pdfjpg-final-download {
          display: flex;
          width: 100%;
          min-height: 54px;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-top: 22px;
          padding: 13px 20px;
          border: 1px solid #477df5;
          border-radius: 12px;
          background: linear-gradient(100deg, #2563eb, #6366f1);
          color: white;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
        }

        .pdfjpg-final-download:disabled {
          cursor: wait;
          opacity: 0.6;
        }

        .pdfjpg-features-section {
          margin-top: 90px;
        }

        .pdfjpg-section-heading {
          margin-bottom: 28px;
          text-align: center;
        }

        .pdfjpg-section-heading h2 {
          margin: 11px 0 9px;
          color: #f8fafc;
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 850;
          letter-spacing: -1px;
          line-height: 1.2;
        }

        .pdfjpg-section-heading p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .pdfjpg-features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pdfjpg-feature-card {
          min-width: 0;
          padding: 25px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 19px;
          background: linear-gradient(145deg, #131e33, #10192b);
          transition: transform 0.25s, border-color 0.25s;
        }

        .pdfjpg-feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(96, 165, 250, 0.4);
        }

        .pdfjpg-feature-icon {
          display: flex;
          width: 49px;
          height: 49px;
          align-items: center;
          justify-content: center;
          margin-bottom: 19px;
          border-radius: 14px;
        }

        .feature-blue {
          background: rgba(59, 130, 246, 0.14);
          color: #60a5fa;
        }

        .feature-purple {
          background: rgba(168, 85, 247, 0.14);
          color: #c084fc;
        }

        .feature-green {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
        }

        .pdfjpg-feature-card h3 {
          margin: 0 0 9px;
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 800;
        }

        .pdfjpg-feature-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.8;
        }

        .pdfjpg-steps-section {
          margin-top: 85px;
          padding: 38px 30px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(20, 31, 53, 0.95), rgba(13, 21, 38, 0.95));
        }

        .pdfjpg-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 25px;
        }

        .pdfjpg-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .pdfjpg-step-number {
          display: flex;
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: 13px;
          background: rgba(37, 99, 235, 0.13);
          color: #93c5fd;
          font-size: 14px;
          font-weight: 900;
        }

        .pdfjpg-step h3 {
          margin: 2px 0 7px;
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 800;
        }

        .pdfjpg-step p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
        }

        .pdfjpg-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 28px;
          padding: 17px 19px;
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 13px;
          background: rgba(245, 158, 11, 0.055);
          color: #fbbf24;
        }

        .pdfjpg-notice svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .pdfjpg-notice p {
          margin: 0;
          color: #aebbd0;
          font-size: 11px;
          line-height: 1.8;
        }

        .pdfjpg-notice strong {
          color: #fcd34d;
        }

        @media (max-width: 760px) {
          .pdfjpg-page {
            padding: 55px 15px 75px;
          }

          .pdfjpg-workspace {
            padding: 21px;
          }

          .pdfjpg-features-grid {
            grid-template-columns: 1fr;
          }

          .pdfjpg-steps-grid {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .pdfjpg-steps-section {
            padding: 27px 21px;
          }

          .pdfjpg-images-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .pdfjpg-page {
            padding: 42px 12px 65px;
          }

          .pdfjpg-hero {
            margin-bottom: 32px;
          }

          .pdfjpg-hero h1 {
            font-size: 43px;
            letter-spacing: -2px;
          }

          .pdfjpg-hero > p {
            font-size: 13px;
            line-height: 1.8;
          }

          .pdfjpg-trust {
            gap: 10px 15px;
            font-size: 10px;
          }

          .pdfjpg-workspace {
            padding: 17px;
            border-radius: 19px;
          }

          .pdfjpg-workspace-heading h2,
          .pdfjpg-results-heading h2 {
            font-size: 21px;
          }

          .pdfjpg-dropzone {
            min-height: 235px;
            padding: 22px 12px;
          }

          .pdfjpg-dropzone h3 {
            font-size: 17px;
          }

          .pdfjpg-selected {
            flex-wrap: wrap;
          }

          .pdfjpg-settings-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .pdfjpg-actions {
            grid-template-columns: 1fr;
          }

          .pdfjpg-actions button {
            min-height: 52px;
          }

          .pdfjpg-results {
            padding: 17px;
          }

          .pdfjpg-images-grid {
            grid-template-columns: 1fr;
          }

          .pdfjpg-preview {
            height: 260px;
          }

          .pdfjpg-features-section {
            margin-top: 65px;
          }

          .pdfjpg-steps-section {
            margin-top: 65px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pdfjpg-page *,
          .pdfjpg-page *::before,
          .pdfjpg-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
