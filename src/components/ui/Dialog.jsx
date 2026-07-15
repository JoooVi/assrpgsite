import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import "./Dialog.css";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = "medium",
  tone = "default",
  className = "",
  overlayClassName = "",
  initialFocusRef,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const target = initialFocusRef?.current
        || dialogRef.current?.querySelector(FOCUSABLE_SELECTOR)
        || dialogRef.current;
      target?.focus();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [closeOnEscape, initialFocusRef, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className={`nero-dialog-overlay ${overlayClassName}`.trim()}
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        className={`nero-dialog nero-dialog-${size} nero-dialog-${tone} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="nero-dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          {showCloseButton && (
            <button type="button" className="nero-dialog-close" onClick={onClose} aria-label="Fechar janela">
              <FaTimes aria-hidden="true" />
            </button>
          )}
        </header>
        <div className="nero-dialog-content">{children}</div>
        {actions && <footer className="nero-dialog-actions">{actions}</footer>}
      </section>
    </div>,
    document.body
  );
};

export default Dialog;
