import { useEffect, useRef } from "react";
import { Icon } from "./Icon.jsx";

export default function Modal({
  title,
  onClose,
  children,
  className = "",
  dismissible = true,
}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  closeRef.current = onClose;
  dismissibleRef.current = dismissible;
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement;
    dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = oldOverflow;
      focused?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissibleRef.current) closeRef.current();
      }}
      onClick={(event) => {
        if (
          dismissible &&
          event.target === event.currentTarget
        )
          onClose();
      }}
    >
      <div className="modal-inner">
        {dismissible && (
          <button
            className="icon-button modal-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        )}
        {children}
      </div>
    </dialog>
  );
}
