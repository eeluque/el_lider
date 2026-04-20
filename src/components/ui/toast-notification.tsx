"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

export function ToastNotification({ message, onClose }: { message: string; onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-[9999] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg min-w-[280px] max-w-sm"
        style={{ backgroundColor: "#a8e6b8", border: "1px solid #7dd4a0" }}
      >
        {/* Checkmark */}
        <div className="flex items-center justify-center size-6 rounded-full bg-white/50 shrink-0">
          <Check className="size-4 text-green-700" strokeWidth={3} />
        </div>

        {/* Texto */}
        <p className="text-sm text-green-900 flex-1">
          <span className="font-bold">¡Éxito!</span>{" "}{message}
        </p>

        {/* X */}
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="text-green-700 hover:text-green-900 transition shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="h-1 rounded-b-lg overflow-hidden" style={{ backgroundColor: "#7dd4a0" }}>
        <div className="h-full animate-shrink" style={{ backgroundColor: "#4caf78" }} />
      </div>
    </div>
  );
}