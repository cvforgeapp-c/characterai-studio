import { useEffect, useRef, useState } from "react";

import {
  exportCanvasVideo,
  downloadExportedVideo,
  releaseExportedVideo,
  type VideoExportResult,
} from "../lib/video-exporter";

interface VideoExportPanelProps {
  canvas: HTMLCanvasElement | null;
  audioStream?: MediaStream;
  onExportComplete?: (result: VideoExportResult) => void;
}

export default function VideoExportPanel({
  canvas,
  audioStream,
  onExportComplete,
}: VideoExportPanelProps) {
  const [duration, setDuration] = useState(15);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<VideoExportResult | null>(null);
  const [error, setError] = useState("");

  const resultRef = useRef<VideoExportResult | null>(null);

  useEffect(() => {
    return () => {
      if (resultRef.current) {
        releaseExportedVideo(resultRef.current);
      }
    };
  }, []);

  async function handleExport() {
    if (!canvas) {
      setError("The 3D character stage is not available.");
      return;
    }

    if (recording) return;

    if (resultRef.current) {
      releaseExportedVideo(resultRef.current);
      resultRef.current = null;
    }

    setResult(null);
    setError("");
    setProgress(0);
    setRecording(true);

    try {
      const exported = await exportCanvasVideo(canvas, {
        duration,
        fps: 30,
        audioStream,
        filename: `characterai-${Date.now()}`,
        onProgress: setProgress,
      });

      resultRef.current = exported;
      setResult(exported);
      onExportComplete?.(exported);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Video export failed. Please try again."
      );
    } finally {
      setRecording(false);
    }
  }

  function handleDownload() {
    if (result) {
      downloadExportedVideo(result);
    }
  }

  return (
    <section className="video-export-panel">
      <div className="export-heading">
        <div>
          <span className="export-eyebrow">FINAL PRODUCTION</span>
          <h2>Export your video</h2>
          <p>Render your character scene into a downloadable video.</p>
        </div>

        <div className="export-icon">▶</div>
      </div>

      <div className="export-settings">
        <label htmlFor="video-duration">
          Video duration
        </label>

        <select
          id="video-duration"
          value={duration}
          disabled={recording}
          onChange={(event) =>
            setDuration(Number(event.target.value))
          }
        >
          <option value={10}>10 seconds</option>
          <option value={15}>15 seconds</option>
          <option value={30}>30 seconds</option>
          <option value={45}>45 seconds</option>
          <option value={60}>60 seconds</option>
        </select>

        <div className="export-specs">
          <span>30 FPS</span>
          <span>WebM format</span>
          <span>Canvas recording</span>
        </div>
      </div>

      {recording && (
        <div className="export-progress">
          <div className="progress-label">
            <span>Recording your scene...</span>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p>
            Keep the studio open until recording finishes.
          </p>
        </div>
      )}

      {error && (
        <div className="export-error" role="alert">
          {error}
        </div>
      )}

      {!result && (
        <button
          className="export-primary-button"
          onClick={handleExport}
          disabled={!canvas || recording}
        >
          {recording ? "Recording..." : "Start video export"}
        </button>
      )}

      {result && (
        <div className="export-success">
          <div className="success-icon">✓</div>

          <div className="success-details">
            <strong>Your video is ready!</strong>
            <span>
              {result.duration.toFixed(1)} seconds · WebM
            </span>
          </div>

          <video
            className="export-preview"
            src={result.url}
            controls
            playsInline
          />

          <button
            className="export-primary-button"
            onClick={handleDownload}
          >
            Download video
          </button>

          <button
            className="export-secondary-button"
            onClick={() => {
              releaseExportedVideo(result);
              resultRef.current = null;
              setResult(null);
              setProgress(0);
            }}
          >
            Create another video
          </button>
        </div>
      )}

      <style>{`
        .video-export-panel {
          width: 100%;
          padding: 24px;
          border: 1px solid #27374a;
          border-radius: 18px;
          background: linear-gradient(145deg, #111d2d, #0b1421);
          color: #f5f7fb;
          font-family: Inter, system-ui, sans-serif;
          box-sizing: border-box;
        }

        .export-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .export-eyebrow {
          color: #37d5c0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .export-heading h2 {
          margin: 8px 0;
          font-size: 23px;
        }

        .export-heading p {
          margin: 0;
          color: #98a7b9;
          font-size: 13px;
          line-height: 1.5;
        }

        .export-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #153d46;
          color: #4ce3cd;
          font-size: 19px;
        }

        .export-settings {
          margin-top: 26px;
        }

        .export-settings label {
          display: block;
          margin-bottom: 9px;
          font-size: 13px;
          font-weight: 700;
        }

        .export-settings select {
          width: 100%;
          padding: 13px;
          border: 1px solid #35475c;
          border-radius: 10px;
          outline: none;
          background: #172538;
          color: white;
          font-size: 14px;
        }

        .export-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 13px;
        }

        .export-specs span {
          padding: 7px 10px;
          border-radius: 7px;
          background: #1b2b3e;
          color: #aab9ca;
          font-size: 11px;
        }

        .export-primary-button {
          width: 100%;
          margin-top: 22px;
          padding: 15px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(100deg, #13bda9, #238be9);
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .export-primary-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .export-secondary-button {
          width: 100%;
          margin-top: 10px;
          padding: 13px;
          border: 1px solid #35475c;
          border-radius: 10px;
          background: transparent;
          color: #dce6f1;
          cursor: pointer;
        }

        .export-progress {
          margin-top: 25px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .progress-label strong {
          color: #43dfc8;
        }

        .progress-track {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #26384b;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #13bda9, #238be9);
          transition: width 0.2s linear;
        }

        .export-progress p {
          color: #93a4b7;
          font-size: 11px;
        }

        .export-error {
          margin-top: 18px;
          padding: 12px;
          border: 1px solid #713b46;
          border-radius: 9px;
          background: #351c27;
          color: #ffb4c0;
          font-size: 12px;
        }

        .export-success {
          margin-top: 24px;
        }

        .success-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #164c40;
          color: #5cf0bd;
          font-size: 20px;
        }

        .success-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 12px;
        }

        .success-details span {
          color: #9aabba;
          font-size: 12px;
        }

        .export-preview {
          display: block;
          width: 100%;
          margin-top: 18px;
          border-radius: 12px;
          background: black;
        }
      `}</style>
    </section>
  );
      }
