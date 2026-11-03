
"use client";

import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import {
  Image as ImageIcon,
  Upload,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

export default function JPGToPDFPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("converted-images.pdf");

  const addImages = (files: FileList | null) => {
    if (!files) return;

    setError("");
    setSuccess("");
    setPdfUrl("");

    const selected = Array.from(files);
    const validImages = selected.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    if (validImages.length !== selected.length) {
      setError("Only JPG, JPEG and PNG images are supported.");
    }

    if (validImages.length === 0) return;

    const newImages = validImages.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((previous) => {
      const imageToRemove = previous.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return previous.filter((image) => image.id !== id);
    });

    setPdfUrl("");
    setSuccess("");
  };

  const clearImages = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    setImages([]);
    setPdfUrl("");
    setSuccess("");
    setError("");
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setPdfUrl("");

    try {
      const pdf = await PDFDocument.create();

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 24;

      for (const image of images) {
        const bytes = await image.file.arrayBuffer();

        const embeddedImage =
          image.file.type === "image/png"
            ? await pdf.embedPng(bytes)
            : await pdf.embedJpg(bytes);

        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(
          availableWidth / embeddedImage.width,
          availableHeight / embeddedImage.height
        );

        const width = embeddedImage.width * scale;
        const height = embeddedImage.height * scale;

        const page = pdf.addPage([pageWidth, pageHeight]);

        page.drawImage(embeddedImage, {
          x: (pageWidth - width) / 2,
          y: (pageHeight - height) / 2,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();

      const blob = new Blob(
        [pdfBytes.buffer as ArrayBuffer],
        { type: "application/pdf" }
      );

      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPdfName("converted-images.pdf");
      setSuccess(
        `Successfully converted ${images.length} image(s) into one PDF.`
      );
    } catch (err) {
      console.error(err);
      setError(
        "Conversion failed. Please check your images and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="jpg-page">
      <section className="jpg-hero">
        <div className="jpg-hero-icon">
          <ImageIcon size={30} />
        </div>

        <span className="jpg-eyebrow">PDFMASTER TOOL</span>

        <h1>JPG to PDF Converter</h1>

        <p>
          Convert your JPG and PNG images into a professional PDF
          document. Upload multiple images and combine them into one file.
        </p>
      </section>

      <section className="jpg-workspace">
        <label className="jpg-upload-box">
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            multiple
            hidden
            onChange={(event) => {
              addImages(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="jpg-upload-icon">
            <Upload size={28} />
          </div>

          <h2>Upload Your Images</h2>

          <p>Choose JPG, JPEG or PNG images from your device</p>

          <span className="jpg-upload-button">
            Select Images
          </span>

          <small>You can select multiple images</small>
        </label>

        {error && (
          <div className="jpg-error">
            <X size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="jpg-success">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {images.length > 0 && (
          <div className="jpg-images-section">
            <div className="jpg-list-heading">
              <div>
                <h2>Your Images</h2>
                <p>{images.length} image(s) selected</p>
              </div>

              <button
                className="jpg-clear-button"
                onClick={clearImages}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>

            <div className="jpg-image-grid">
              {images.map((image, index) => (
                <div className="jpg-image-card" key={image.id}>
                  <div className="jpg-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.preview} alt={image.file.name} />

                    <button
                      className="jpg-remove-image"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remove ${image.file.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="jpg-image-details">
                    <strong>Image {index + 1}</strong>
                    <span>{image.file.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="jpg-convert-button"
              onClick={convertToPDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="jpg-spinner" size={20} />
                  Converting Images...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}

        {pdfUrl && (
          <div className="jpg-download-section">
            <div className="jpg-download-icon">
              <CheckCircle2 size={28} />
            </div>

            <div className="jpg-download-info">
              <h3>Your PDF is Ready!</h3>
              <p>{pdfName}</p>
            </div>

            <button
              className="jpg-download-button"
              onClick={downloadPDF}
            >
              <Download size={19} />
              Download PDF
            </button>
          </div>
        )}
      </section>

      <section className="jpg-features">
        <div>
          <ImageIcon size={23} />
          <h3>Multiple Images</h3>
          <p>Combine multiple images into one PDF document.</p>
        </div>

        <div>
          <FileText size={23} />
          <h3>Original Order</h3>
          <p>Your images appear in the same order you upload them.</p>
        </div>

        <div>
          <CheckCircle2 size={23} />
          <h3>Private Conversion</h3>
          <p>Images are processed locally in your browser.</p>
        </div>
      </section>

      <style jsx>{`
        .jpg-page {
          min-height: 80vh;
          padding: 65px 20px 80px;
          background: #f7f8fc;
          color: #101a35;
        }

        .jpg-hero {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .jpg-hero-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 20px;
          background: #eeeaff;
          color: #7255e8;
        }

        .jpg-eyebrow {
          color: #7255e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .jpg-hero h1 {
          margin: 12px 0;
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -1.8px;
        }

        .jpg-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: #69738d;
          font-size: 15px;
          line-height: 1.8;
        }

        .jpg-workspace {
          max-width: 900px;
          margin: 0 auto;
          padding: 25px;
          border: 1px solid #e3e8f2;
          border-radius: 23px;
          background: white;
          box-shadow: 0 18px 55px rgba(22, 34, 70, 0.07);
        }

        .jpg-upload-box {
          min-height: 270px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #cfc6f8;
          border-radius: 17px;
          background: #faf9ff;
          cursor: pointer;
          transition: 0.2s;
        }

        .jpg-upload-box:hover {
          border-color: #7255e8;
          background: #f4f1ff;
        }

        .jpg-upload-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #eeeaff;
          color: #7255e8;
        }

        .jpg-upload-box h2 {
          margin: 17px 0 5px;
          font-size: 21px;
        }

        .jpg-upload-box p {
          margin: 0 0 17px;
          color: #69738d;
          font-size: 13px;
          text-align: center;
        }

        .jpg-upload-button,
        .jpg-convert-button,
        .jpg-download-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 22px;
          border: 0;
          border-radius: 11px;
          background: #7255e8;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .jpg-upload-button:hover,
        .jpg-convert-button:hover,
        .jpg-download-button:hover {
          background: #5940c7;
          transform: translateY(-2px);
        }

        .jpg-upload-box small {
          margin-top: 14px;
          color: #929bb0;
          font-size: 11px;
        }

        .jpg-images-section {
          margin-top: 28px;
        }

        .jpg-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .jpg-list-heading h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .jpg-list-heading p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .jpg-clear-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid #f2d5d8;
          border-radius: 9px;
          background: #fff5f5;
          color: #c0394b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .jpg-image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 14px;
        }

        .jpg-image-card {
          overflow: hidden;
          border: 1px solid #e3e8f2;
          border-radius: 13px;
          background: white;
        }

        .jpg-preview {
          position: relative;
          height: 135px;
          display: grid;
          place-items: center;
          padding: 8px;
          background: #f4f5fa;
        }

        .jpg-preview img {
          max-width: 100%;
          max-height: 120px;
          object-fit: contain;
        }

        .jpg-remove-image {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #d64b5b;
          cursor: pointer;
          box-shadow: 0 2px 8px #00000015;
        }

        .jpg-image-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
        }

        .jpg-image-details strong {
          font-size: 12px;
        }

        .jpg-image-details span {
          overflow: hidden;
          color: #8992a8;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .jpg-convert-button {
          width: 100%;
          margin-top: 22px;
          padding: 16px;
          font-size: 15px;
        }

        .jpg-convert-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .jpg-spinner {
          animation: jpg-spin 1s linear infinite;
        }

        @keyframes jpg-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .jpg-error,
        .jpg-success {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 16px;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .jpg-error {
          background: #fff0f0;
          color: #c0394b;
        }

        .jpg-success {
          background: #edfaf2;
          color: #21834a;
        }

        .jpg-download-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 22px;
          padding: 18px;
          border: 1px solid #d8eddf;
          border-radius: 15px;
          background: #f5fcf7;
        }

        .jpg-download-icon {
          color: #21834a;
        }

        .jpg-download-info {
          flex: 1;
          min-width: 0;
        }

        .jpg-download-info h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .jpg-download-info p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .jpg-features {
          max-width: 950px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 45px auto 0;
        }

        .jpg-features > div {
          padding: 22px;
          border: 1px solid #e3e8f2;
          border-radius: 16px;
          background: white;
        }

        .jpg-features svg {
          color: #7255e8;
        }

        .jpg-features h3 {
          margin: 12px 0 6px;
          font-size: 15px;
        }

        .jpg-features p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .jpg-page {
            padding: 40px 13px 55px;
          }

          .jpg-workspace {
            padding: 13px;
          }

          .jpg-download-section {
            flex-wrap: wrap;
          }

          .jpg-download-button {
            width: 100%;
          }

          .jpg-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
