import { useEffect, useMemo, useRef, useState } from 'react';

export const sampleSoopVodItems = [
  {
    id: 'soop-vod-1',
    title: '아프리카 VOD 샘플 01',
    thumbnail: 'https://placehold.co/640x360/12332b/ffffff?text=SOOP+VOD+01',
    url: 'https://www.youtube.com/shorts/MEe-VWeUxrY',
    createdAt: '2026.04.23',
    duration: '12:48',
  },
  {
    id: 'soop-vod-2',
    title: '아프리카 VOD 샘플 02',
    thumbnail: 'https://placehold.co/640x360/172a3a/ffffff?text=SOOP+VOD+02',
    url: 'https://vod.sooplive.com/player/192362499',
    createdAt: '2026.04.22',
    duration: '08:31',
  },
  {
    id: 'soop-vod-3',
    title: '아프리카 VOD 샘플 03',
    thumbnail: 'https://placehold.co/640x360/231f20/ffffff?text=SOOP+VOD+03',
    url: 'https://vod.sooplive.com/player/193193621',
    createdAt: '2026.04.21',
    duration: '16:05',
  },
];

export const sampleSoopLiveItems = [
  {
    id: 'soop-live-1',
    title: '아프리카 라이브 샘플 01',
    thumbnail: 'https://placehold.co/640x360/193057/ffffff?text=SOOP+LIVE+01',
    url: 'https://www.youtube.com/shorts/MEe-VWeUxrY',
    isLive: true,
    viewerCount: 1284,
  },
  {
    id: 'soop-live-2',
    title: '아프리카 라이브 샘플 02',
    thumbnail: 'https://placehold.co/640x360/3a1d1d/ffffff?text=SOOP+LIVE+02',
    url: 'https://play.sooplive.co.kr/suhi370erw',
    isLive: true,
    viewerCount: 842,
  },
];

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

export function getSoopEmbedInfo(url) {
  const youtubeId = getYouTubeVideoId(url);

  if (youtubeId) {
    return {
      canEmbed: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      fallbackUrl: url,
      provider: 'youtube',
    };
  }

  const vodMatch = url.match(/(?:vod\.)?sooplive\.(?:com|co\.kr)\/player\/(\d+)/i);

  if (vodMatch) {
    return {
      canEmbed: true,
      embedUrl: `https://vod.sooplive.co.kr/player/${vodMatch[1]}/embed`,
      fallbackUrl: url,
      provider: 'soop-vod',
    };
  }

  const liveMatch = url.match(/play\.sooplive\.(?:com|co\.kr)\/([a-zA-Z0-9_-]+)/i);

  if (liveMatch) {
    return {
      canEmbed: true,
      embedUrl: `https://play.sooplive.co.kr/${liveMatch[1]}/embed`,
      fallbackUrl: url,
      provider: 'soop-live',
    };
  }

  return {
    canEmbed: false,
    embedUrl: '',
    fallbackUrl: url,
    provider: 'unknown',
  };
}

function formatViewerCount(count) {
  return new Intl.NumberFormat('ko-KR').format(count);
}

function SoopSection({ vodItems = sampleSoopVodItems, liveItems = sampleSoopLiveItems }) {
  const [activeTab, setActiveTab] = useState('vod');
  const [selectedItem, setSelectedItem] = useState(null);

  const items = activeTab === 'vod' ? vodItems : liveItems;
  const emptyText = activeTab === 'vod' ? '등록된 VOD가 없습니다.' : '현재 라이브가 없습니다.';

  return (
    <section className="soop-section">
      <div className="soop-section__head">
        <div className="section-title compact-title">
          <p className="section-eyebrow">SOOP</p>
          <h2>아프리카 VOD / 라이브</h2>
          <p>SOOP VOD 카드처럼 가로 썸네일 중심으로 정리하고, 클릭하면 페이지 이동 없이 모달에서 재생합니다.</p>
        </div>

        <div className="soop-tabs" role="tablist" aria-label="SOOP 콘텐츠 탭">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'vod'}
            className={`soop-tabs__button ${activeTab === 'vod' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('vod')}
          >
            VOD 목록
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'live'}
            className={`soop-tabs__button ${activeTab === 'live' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            라이브 목록
          </button>
        </div>
      </div>

      <SoopRail items={items} type={activeTab} emptyText={emptyText} onOpenItem={setSelectedItem} />

      {selectedItem ? <SoopPlayerModal item={selectedItem} onClose={() => setSelectedItem(null)} /> : null}
    </section>
  );
}

function SoopRail({ items, type, emptyText, onOpenItem }) {
  const railRef = useRef(null);

  const handleNext = () => {
    railRef.current?.scrollBy({
      left: railRef.current.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) {
    return <div className="soop-empty">{emptyText}</div>;
  }

  return (
    <div className="soop-rail-shell">
      <div className="soop-rail" ref={railRef}>
        {items.map((item) => (
          <SoopCard key={item.id} item={item} type={type} onClick={() => onOpenItem(item)} />
        ))}
      </div>

      <button type="button" className="soop-rail-next" onClick={handleNext} aria-label="다음 SOOP 목록 보기">
        &gt;
      </button>
    </div>
  );
}

function SoopCard({ item, type, onClick }) {
  return (
    <button type="button" className="soop-card" onClick={onClick}>
      <span className="soop-card__thumb">
        <img src={item.thumbnail} alt={item.title} className="soop-card__image" loading="lazy" />
        {type === 'live' && item.isLive ? <span className="soop-card__live-badge">LIVE</span> : null}
        {type === 'vod' && item.duration ? <span className="soop-card__duration">{item.duration}</span> : null}
      </span>

      <span className="soop-card__body">
        <strong className="soop-card__title">{item.title}</strong>
        <span className="soop-card__meta">
          {type === 'vod' ? item.createdAt : `${formatViewerCount(item.viewerCount)}명 시청 중`}
        </span>
      </span>
    </button>
  );
}

function SoopPlayerModal({ item, onClose }) {
  const embedInfo = useMemo(() => getSoopEmbedInfo(item.url), [item.url]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="soop-modal" role="dialog" aria-modal="true" aria-label={`${item.title} 플레이어`}>
      <button type="button" className="soop-modal__backdrop" onClick={onClose} aria-label="모달 닫기" />

      <div className="soop-modal__panel">
        <div className="soop-modal__head">
          <strong>{item.title}</strong>
          <button type="button" className="soop-modal__close" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="soop-modal__player">
          {embedInfo.canEmbed ? (
            <iframe
              title={item.title}
              src={embedInfo.embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="soop-modal__fallback">
              <p>이 SOOP URL은 현재 임베드 규칙을 확인할 수 없어 직접 열기로 제공합니다.</p>
              <a href={embedInfo.fallbackUrl} target="_blank" rel="noreferrer">
                SOOP에서 보기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SoopSection;
