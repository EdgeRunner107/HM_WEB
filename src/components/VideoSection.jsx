import { useRef } from 'react';

function getYouTubeVideoId(url) {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);

  if (shortsMatch) {
    return shortsMatch[1];
  }

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/i);

  if (watchMatch) {
    return watchMatch[1];
  }

  const shortLinkMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);

  return shortLinkMatch ? shortLinkMatch[1] : '';
}

export function getEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }

  const soopMatch = url.match(/sooplive\.(?:com|co\.kr)\/player\/(\d+)/i);

  if (soopMatch) {
    return `https://vod.sooplive.co.kr/player/${soopMatch[1]}/embed`;
  }

  return url;
}

function VideoSection({ videos, onOpenVideo }) {
  const railRef = useRef(null);

  const handleNext = () => {
    railRef.current?.scrollBy({
      left: railRef.current.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  return (
    <section className="video-section">
      <div className="section-title compact-title">
        <p className="section-eyebrow">SHORTS</p>
        <h2>유튜브 쇼츠</h2>
      
      </div>

      <div className="scroll-rail-shell">
        <div className="video-rail" ref={railRef}>
          {videos.map((video) => (
            <button key={video.id} type="button" className="video-poster-card" onClick={() => onOpenVideo(video)}>
              <div className="video-poster-card__thumb">
                <img src={video.thumbnail} alt={video.title} className="video-poster-card__thumb-image" loading="lazy" />
              </div>
              <div className="video-poster-card__content">
                <strong className="video-poster-card__title">{video.title}</strong>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="rail-next-button" onClick={handleNext} aria-label="쇼츠 다음 목록 보기">
          &gt;
        </button>
      </div>
    </section>
  );
}

export default VideoSection;
