import { useEffect, useState } from "react";
import VideoExportPanel from "./VideoExportPanel";

export default function StudioVideoExport() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let observer: MutationObserver;

    const findCanvas = () => {
      const stage =
        document.querySelector(
          "[data-studio-stage] canvas"
        ) ||
        document.querySelector(
          ".studio-stage canvas"
        ) ||
        document.querySelector(
          ".character-stage canvas"
        ) ||
        document.querySelector("canvas");

      setCanvas(stage instanceof HTMLCanvasElement ? stage : null);
    };

    findCanvas();

    observer = new MutationObserver(findCanvas);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const interval = window.setInterval(findCanvas, 1500);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="studio-export-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close Export" : "🎬 Export Video"}
      </button>

      {open && (
        <div className="studio-export-overlay">
          <div className="studio-export-window">
            <button
              type="button"
              className="studio-export-close"
              onClick={() => setOpen(false)}
              aria-label="Close export panel"
            >
              ×
            </button>

            <VideoExportPanel canvas={canvas} />
          </div>
        </div>
      )}

      <style>{`
        .studio-export-trigger {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
          padding: 14px 21px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(110deg, #13bda9, #238be9);
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 30px #0005;
        }

        .studio-export-overlay {
          position: fixed;
          inset: 0;
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #050b14d9;
          backdrop-filter: blur(9px);
        }

        .studio-export-window {
          position: relative;
          width: min(100%, 480px);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 18px;
        }

        .studio-export-close {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #26384b;
          color: white;
          font-size: 23px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
