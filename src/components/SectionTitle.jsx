function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="section-title">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default SectionTitle;
