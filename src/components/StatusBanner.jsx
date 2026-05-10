function StatusBanner({ messages }) {
  return (
    <section className="status-banner" aria-label="운영 상태 배너">
      {messages.map((message) => (
        <div key={message} className="status-banner__item">
          <span className="status-banner__dot" aria-hidden="true" />
          <span className="status-banner__text">{message}</span>
        </div>
      ))}
    </section>
  );
}

export default StatusBanner;
