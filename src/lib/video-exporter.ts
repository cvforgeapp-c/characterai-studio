export interface VideoExportOptions {
  duration?: number;
  fps?: number;
  audioStream?: MediaStream;
  filename?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (blob: Blob) => void;
}

export interface VideoExportResult {
  blob: Blob;
  url: string;
  filename: string;
  duration: number;
}

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  return (
    types.find((type) => MediaRecorder.isTypeSupported(type)) ||
    ""
  );
}

export async function exportCanvasVideo(
  canvas: HTMLCanvasElement,
  options: VideoExportOptions = {}
): Promise<VideoExportResult> {
  const {
    duration = 15,
    fps = 30,
    audioStream,
    filename = "characterai-studio-video",
    onProgress,
    onComplete,
  } = options;

  if (!canvas) {
    throw new Error("The 3D stage canvas could not be found.");
  }

  if (!canvas.captureStream) {
    throw new Error(
      "Canvas video recording is not supported by this browser."
    );
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "Video recording is not supported by this browser."
    );
  }

  const mimeType = getSupportedMimeType();

  if (!mimeType) {
    throw new Error(
      "This browser does not support WebM video recording."
    );
  }

  const videoStream = canvas.captureStream(fps);

  const tracks: MediaStreamTrack[] = [
    ...videoStream.getVideoTracks(),
  ];

  if (audioStream) {
    tracks.push(...audioStream.getAudioTracks());
  }

  const combinedStream = new MediaStream(tracks);

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: BlobPart[] = [];

  return new Promise((resolve, reject) => {
    let completed = false;
    let progressTimer: ReturnType<typeof setInterval> | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const startedAt = Date.now();

    const cleanup = () => {
      if (progressTimer) clearInterval(progressTimer);
      if (stopTimer) clearTimeout(stopTimer);

      videoStream.getTracks().forEach((track) => track.stop());

      // Do not stop audio tracks supplied by the caller.
    };

    const fail = (error: Error) => {
      if (completed) return;
      completed = true;

      cleanup();

      try {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      } catch {
        // Recorder may already have stopped.
      }

      reject(error);
    };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      fail(new Error("Video recording failed."));
    };

    recorder.onstop = () => {
      if (completed) return;
      completed = true;

      cleanup();

      const blob = new Blob(chunks, {
        type: mimeType,
      });

      if (blob.size === 0) {
        reject(new Error("The exported video is empty."));
        return;
      }

      const url = URL.createObjectURL(blob);

      const result: VideoExportResult = {
        blob,
        url,
        filename: `${filename}.webm`,
        duration: (Date.now() - startedAt) / 1000,
      };

      onProgress?.(100);
      onComplete?.(blob);

      resolve(result);
    };

    try {
      recorder.start(1000);

      progressTimer = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        const progress = Math.min(
          99,
          Math.round((elapsed / duration) * 100)
        );

        onProgress?.(progress);
      }, 200);

      stopTimer = setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, duration * 1000);
    } catch {
      fail(new Error("Unable to start video recording."));
    }
  });
}

export function downloadExportedVideo(
  result: VideoExportResult
): void {
  const link = document.createElement("a");

  link.href = result.url;
  link.download = result.filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function releaseExportedVideo(
  result: VideoExportResult
): void {
  URL.revokeObjectURL(result.url);
}
