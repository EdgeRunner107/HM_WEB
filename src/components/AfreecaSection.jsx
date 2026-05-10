import { useRef } from 'react';

function AfreecaSection({ items, onOpenVideo }) {
  const railRef = useRef(null);

  const handleNext = () => {
    railRef.current?.scrollBy({
      left: railRef.current.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  return (
    <section className="video-section afreeca-section">
      <div className="section-title compact-title">
        <p className="section-eyebrow">SOOP</p>
        <h2>아프리카 VOD / 라이브</h2>
        
      </div>

      <div className="scroll-rail-shell">
        <div className="afreeca-rail" ref={railRef}>
          {items.map((item) => (
            <button key={item.id} type="button" className="video-poster-card" onClick={() => onOpenVideo(item)}>
              <div className="video-poster-card__thumb">
                <img src={item.thumbnail} alt={item.title} className="video-poster-card__thumb-image" loading="lazy" />
              </div>
              <div className="video-poster-card__content">
                <strong className="video-poster-card__title">{item.title}</strong>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="rail-next-button" onClick={handleNext} aria-label="아프리카 다음 목록 보기">
          &gt;
        </button>
      </div>
    </section>
  );
}

export default AfreecaSection;
