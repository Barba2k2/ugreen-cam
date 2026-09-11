interface NoticeDsProps {
  message: string;
  dismissLabel: string;
  onDismiss: () => void;
}

export function NoticeDs({ message, dismissLabel, onDismiss }: NoticeDsProps) {
  return (
    <div className="notice-ds" role="alert">
      <span className="notice-ds__message">{message}</span>
      <button className="notice-ds__dismiss" type="button" onClick={onDismiss}>
        {dismissLabel}
      </button>
    </div>
  );
}
