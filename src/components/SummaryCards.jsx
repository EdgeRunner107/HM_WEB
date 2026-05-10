function SummaryCards({ items }) {
  return (
    <div className="summary-grid">
      {items.map((item) => (
        <article key={item.id} className="summary-card">
          <p className="summary-card__label">{item.label}</p>
          <div className="summary-card__value">{item.value}</div>
          <p className="summary-card__description">{item.description}</p>
        </article>
      ))}
    </div>
  );
}

export default SummaryCards;
