import React, { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const STORAGE_KEY = "gratehcare-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const isIosSafari = () => {
  const ua = window.navigator.userAgent;
  if (!isIosDevice()) return false;
  const isWebkit = /applewebkit/i.test(ua);
  const isOtherBrowser = /crios|fxios|edgios|opios|opt\//i.test(ua);
  return isWebkit && !isOtherBrowser;
};

const dismiss = () => window.sessionStorage.setItem(STORAGE_KEY, "1");

const PwaInstallBanner: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || window.sessionStorage.getItem(STORAGE_KEY) === "1") {
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHelp(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    const timer = window.setTimeout(() => {
      if (isStandalone() || window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
      if (isIosDevice()) {
        setIosHelp(true);
        setVisible(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;
  if (!iosHelp && !deferred) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[90] mx-auto max-w-lg rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-xl backdrop-blur sm:bottom-6">
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Install GRATEHCARE</p>
          {iosHelp ? (
            <div className="mt-1 space-y-2 text-xs text-slate-600">
              <p>
                iPhone does not show an Install button. Open this site in{" "}
                <strong>Safari</strong>, then:
              </p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>
                  Tap the <Share className="inline h-3.5 w-3.5" /> Share button
                </li>
                <li>Scroll and tap <strong>Add to Home Screen</strong></li>
                <li>Tap <strong>Add</strong></li>
              </ol>
              {!isIosSafari() && (
                <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-amber-800">
                  You are not in Safari. Copy the link and open it in Safari first.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500">
              Add it to your home screen for faster access, like an app.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            {deferred && !iosHelp && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                onClick={async () => {
                  await deferred.prompt();
                  await deferred.userChoice;
                  setVisible(false);
                  setDeferred(null);
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
            )}
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => {
                dismiss();
                setVisible(false);
              }}
            >
              {iosHelp ? "Got it" : "Not now"}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          aria-label="Dismiss install prompt"
          onClick={() => {
            dismiss();
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
