import { useEffect, useMemo, useRef, useState } from 'react';

const API_ENDPOINTS = {
  posts: 'https://hm-web-back.onrender.com/posts',
  shorts: 'https://hm-web-back.onrender.com/shorts',
  vod: 'https://hm-web-back.onrender.com/afvods',
  live: 'https://hm-web-back.onrender.com/aflives',
};

const PLACEHOLDER_IMAGES = {
  posts: 'https://placehold.co/640x360/241f1b/ffffff?text=POST',
  shorts: 'https://placehold.co/360x640/151515/ffffff?text=SHORTS',
  vod: 'https://placehold.co/640x360/12332b/ffffff?text=AFREECA+VOD',
  live: 'https://placehold.co/640x360/193057/ffffff?text=AFREECA+LIVE',
};

const SECTIONS = [
  
  {
    type: 'posts',
    eyebrow: '게시글',
    title: '',
    description: '',
    emptyText: '등록된 게시글이 없습니다.',
  },
   {
    type: 'live',
    eyebrow: 'AFREECA LIVE',
    title: '',
    description: '',
    emptyText: '등록된 아프리카 라이브가 없습니다.',
  },
  {
    type: 'shorts',
    eyebrow: 'shorts',
    title: '',
    description: '',
    emptyText: '등록된 유튜브 쇼츠가 없습니다.',
  },
  {
    type: 'vod',
    eyebrow: 'AFREECA VOD',
    title: '',
    description: '',
    emptyText: '등록된 아프리카 VOD가 없습니다.',
  },
 
];

const INITIAL_STATE = {
  posts: { items: [], loading: true, error: '' },
  shorts: { items: [], loading: true, error: '' },
  vod: { items: [], loading: true, error: '' },
  live: { items: [], loading: true, error: '' },
};

function pickFirstValue(item, keys, fallback = '') {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
  }

  return fallback;
}

function extractArray(payload, type) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const candidateKeys = [type, 'items', 'data', 'results', 'list', 'posts', 'videos', 'vods', 'lives', 'shorts'];

  for (const key of candidateKeys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  return [];
}

function getTimestamp(item) {
  const dateValue = pickFirstValue(item, ['createdAt', 'created_at', 'publishedAt', 'updatedAt', 'date', 'time', 'timestamp']);
  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function normalizeItem(rawItem, type, index) {
  if (type === 'posts') {
    if (Array.isArray(rawItem)) {
      return rawItem;
    }

    const url = pickFirstValue(rawItem, ['url', 'link', 'href', 'postUrl', 'post_url']);
    const content = String(pickFirstValue(rawItem, ['contents', 'content', 'body', 'text', 'description', 'summary', 'message'], ''));
    const createdAt = String(pickFirstValue(rawItem, ['createdAt', 'created_at', 'publishedAt', 'updatedAt', 'date'], ''));

    return {
      id: String(pickFirstValue(rawItem, ['id', '_id', 'postId', 'post_id'], `${type}-${index}-${url || content || 'item'}`)),
      title: String(pickFirstValue(rawItem, ['title', 'name', 'subject'], `${titleLabel(type)} ${index + 1}`)),
      content,
      url: String(url),
      author: String(pickFirstValue(rawItem, ['author', 'writer', 'nickname', 'userName', 'user_name'], '')),
      createdAt,
      duration: '',
      isLive: false,
      viewerCount: 0,
    };
  }

  if (type === 'live' && Array.isArray(rawItem)) {
    const liveItem = [...rawItem];
    liveItem.id = `${type}-${index}-${rawItem[1] || rawItem[0] || 'item'}`;
    liveItem.url = String(rawItem[1] ?? '');

    return liveItem;
  }

  if (Array.isArray(rawItem)) {
    const title = String(rawItem[0] ?? `${titleLabel(type)} ${index + 1}`);
    const url = String(rawItem[1] ?? '');

    return {
      id: `${type}-${index}-${url || title}`,
      title,
      thumbnail: getThumbnailFromUrl(url, type),
      url,
      createdAt: '',
      duration: '',
      isLive: type === 'live',
      viewerCount: 0,
    };
  }

  const url = pickFirstValue(rawItem, [
    'url',
    'link',
    'href',
    'videoUrl',
    'video_url',
    'vodUrl',
    'vod_url',
    'liveUrl',
    'live_url',
    'shortsUrl',
    'shorts_url',
  ]);

  return {
    id: String(pickFirstValue(rawItem, ['id', '_id', 'videoId', 'vodId', 'liveId'], `${type}-${index}-${url || 'item'}`)),
    title: String(pickFirstValue(rawItem, ['title', 'name', 'subject', 'broadcastTitle'], `${titleLabel(type)} ${index + 1}`)),
    thumbnail: String(
      pickFirstValue(rawItem, ['thumbnail', 'thumbnailUrl', 'thumbnail_url', 'thumb', 'image', 'imageUrl', 'poster'], getThumbnailFromUrl(url, type))
    ),
    url: String(url),
    createdAt: String(pickFirstValue(rawItem, ['createdAt', 'created_at', 'publishedAt', 'updatedAt', 'date'], '')),
    duration: String(pickFirstValue(rawItem, ['duration', 'playTime', 'play_time', 'length'], '')),
    isLive: Boolean(pickFirstValue(rawItem, ['isLive', 'is_live', 'live'], type === 'live')),
    viewerCount: Number(pickFirstValue(rawItem, ['viewerCount', 'viewer_count', 'viewers', 'currentViewers'], 0)) || 0,
  };
}

function getThumbnailFromUrl(url, type) {
  const youtubeId = getYouTubeVideoId(url);

  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return PLACEHOLDER_IMAGES[type];
}

function normalizeItems(payload, type) {
  return extractArray(payload, type)
    .map((item, index) => normalizeItem(item, type, index))
    .filter((item) => type === 'posts' || item.url)
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, 10);
}

async function fetchMediaList(type, signal) {
  const response = await fetch(API_ENDPOINTS[type], { signal });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  return normalizeItems(payload, type);
}

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

function getMediaEmbedInfo(url) {
  const youtubeId = getYouTubeVideoId(url);

  if (youtubeId) {
    return {
      canEmbed: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      fallbackUrl: url,
    };
  }

  const vodMatch = url.match(/(?:vod\.)?sooplive\.(?:com|co\.kr)\/player\/(\d+)/i);

  if (vodMatch) {
    return {
      canEmbed: true,
      embedUrl: `https://vod.sooplive.co.kr/player/${vodMatch[1]}/embed`,
      fallbackUrl: url,
    };
  }

  const liveMatch = url.match(/play\.sooplive\.(?:com|co\.kr)\/([a-zA-Z0-9_-]+)/i);

  if (liveMatch) {
    return {
      canEmbed: true,
      embedUrl: `https://play.sooplive.co.kr/${liveMatch[1]}/embed`,
      fallbackUrl: url,
    };
  }

  return {
    canEmbed: false,
    embedUrl: '',
    fallbackUrl: url,
  };
}

function formatViewerCount(count) {
  return new Intl.NumberFormat('ko-KR').format(count);
}

function MediaTabs() {
  const [mediaState, setMediaState] = useState(INITIAL_STATE);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    SECTIONS.forEach(({ type }) => {
      fetchMediaList(type, controller.signal)
        .then((items) => {
          setMediaState((current) => ({
            ...current,
            [type]: { items, loading: false, error: '' },
          }));
        })
        .catch((error) => {
          if (error.name === 'AbortError') {
            return;
          }

          setMediaState((current) => ({
            ...current,
            [type]: { items: [], loading: false, error: '목록을 불러오지 못했습니다.' },
          }));
        });
    });

    return () => controller.abort();
  }, []);

  return (
    <div className="media-stack">
      {SECTIONS.map((section) => (
        <MediaSection
          key={section.type}
          {...section}
          items={mediaState[section.type].items}
          loading={mediaState[section.type].loading}
          error={mediaState[section.type].error}
          onOpenItem={setSelectedItem}
        />
      ))}

      {selectedItem ? <MediaModal item={selectedItem.item} type={selectedItem.type} onClose={() => setSelectedItem(null)} /> : null}
    </div>
  );
}

function MediaSection({ eyebrow, title, description, items, loading, error, type, emptyText, onOpenItem }) {
  return (
    <section className="media-row-section">
      <div className="section-title compact-title">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <MediaRail
        items={items}
        type={type}
        loading={loading}
        error={error}
        emptyText={emptyText}
        onOpenItem={(item) => onOpenItem({ item, type })}
      />
    </section>
  );
}

function MediaRail({ items, type, loading, error, emptyText, onOpenItem }) {
  const railRef = useRef(null);

  const handleNext = () => {
    railRef.current?.scrollBy({
      left: railRef.current.clientWidth * 0.85,
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    railRef.current?.scrollBy({
      left: railRef.current.clientWidth * -0.85,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <div className="media-empty">목록을 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div className="media-empty">{error}</div>;
  }

  if (!items.length) {
    return <div className="media-empty">{emptyText}</div>;
  }

  return (
    <div className="media-rail-shell">
      <div className={`media-rail media-rail--${type}`} ref={railRef}>
        {items.map((item) =>
          type === 'posts' ? (
            <PostCard key={`${item?.[4] || item?.[0] || 'post'}-${item?.[2] || ''}`} item={item} />
          ) : type === 'shorts' ? (
            <ShortsCard key={item.id} item={item} onClick={() => onOpenItem(item)} />
          ) : type === 'vod' ? (
            <VodPlayerCard key={item.id} item={item} />
          ) : (
            <SoopMediaCard key={item.id} item={item} type={type} onClick={() => onOpenItem(item)} />
          )
        )}
      </div>

      <button type="button" className="media-rail-prev" onClick={handlePrev} aria-label={`${titleLabel(type)} 이전 목록 보기`}>
        &lt;
      </button>
      <button type="button" className="media-rail-next" onClick={handleNext} aria-label={`${titleLabel(type)} 다음 목록 보기`}>
        &gt;
      </button>
    </div>
  );
}

function titleLabel(type) {
  if (type === 'posts') {
    return '게시글';
  }

  if (type === 'shorts') {
    return '유튜브';
  }

  if (type === 'vod') {
    return '아프리카 VOD';
  }

  return '아프리카 라이브';
}

function PostCard({ item }) {
  const getSoopProfileImage = (url) => {
    const id = url?.match(/station\/([^/]+)/)?.[1];
    if (!id) return '';
    const prefix = id.slice(0, 2);
    return `https://profile.img.sooplive.com/LOGO/${prefix}/${id}/${id}.jpg`;
  };

  return (
    <div className="post-card w-[310px] flex-shrink-0 px-2">
      <a
        href={item[4] || ''}
        target="_blank"
        rel="noopener noreferrer"
        className="post-card__inner flex items-start gap-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition p-3"
      >
        <img
          src={getSoopProfileImage(item[4])}
          alt="profile"
          className="post-card__profile w-12 h-12 rounded-full border-2 border-cyan-400 object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <div className="post-card__text flex flex-col w-full overflow-hidden">
          <div className="post-card__meta flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span className="post-card__author font-medium truncate max-w-[120px]">{item[3]}</span>
            <span className="post-card__dot text-gray-400">·</span>
           
          </div>

          <div className="post-card__title text-sm font-semibold truncate mt-1 mb-1">{item[0]}</div>

          <div className="post-card__content text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">{item[1]}</div>
        </div>
      </a>
    </div>
  );
}

function ShortsCard({ item, onClick }) {
  return (
    <button type="button" className="video-poster-card" onClick={onClick}>
      <div className="video-poster-card__thumb">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="video-poster-card__thumb-image"
          loading="lazy"
        />
      </div>

      <div className="video-poster-card__content">
        <strong
          className="video-poster-card__title"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.35',
            maxHeight: '2.7em',
            wordBreak: 'break-word',
            fontSize: '14px',
          }}
        >
          {item.title}
        </strong>
      </div>
    </button>
  );
}

function VodPlayerCard({ item }) {
  const embedInfo = getMediaEmbedInfo(item.url);

  return (
    <article className="vod-player-card">
      <div className="vod-player-card__frame">
        {embedInfo.canEmbed ? (
          <iframe
            title={item.title}
            src={embedInfo.embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="vod-player-card__fallback">
            <a href={item.url} target="_blank" rel="noreferrer">
              VOD 열기
            </a>
          </div>
        )}
      </div>
      <div className="vod-player-card__body">
        <strong className="soop-card__title">{item.title}</strong>
        <span className="soop-card__meta">{item.createdAt}</span>
      </div>
    </article>
  );
}

function SoopMediaCard({ item, type, onClick }) {
  const liveUrl = type === 'live' ? String(item?.[1] ?? '') : '';
  const liveTitle = type === 'live' ? String(item?.[0] ?? '') : item.title;
  const liveName = type === 'live' ? String(item?.[3] ?? '') : '';
  const bno = type === 'live' ? item?.[1]?.split('/').pop() : '';
  const thumbnail = type === 'live' ? (bno ? `https://liveimg.sooplive.com/${bno}?${Date.now()}` : '') : item.thumbnail;

  if (type === 'live') {
    return (
      <a type="button" className="soop-card" href={liveUrl} target="_blank" rel="noopener noreferrer">
        <span className="soop-card__thumb">
          <img src={thumbnail} alt={bno || liveTitle} className="soop-card__image" loading="lazy" />
          <div className="soop-card__live-badge absolute top-2 left-2 flex items-center gap-1 text-white text-[11px] px-2 py-[2px] rounded-full bg-black/60">
            <span className="text-red-500 text-[12px]">●</span>
            <span>LIVE</span>
          </div>
          {item.duration ? <span className="soop-card__duration">{item.duration}</span> : null}
        </span>

        <span className="soop-card__body">
          <span className="soop-card__meta">{liveName}</span>
          <strong className="soop-card__title">{liveTitle}</strong>
        </span>
      </a>
    );
  }

  return (
    <button type="button" className="soop-card" onClick={onClick}>
      <span className="soop-card__thumb">
        <img src={item.thumbnail} alt={item.title} className="soop-card__image" loading="lazy" />
        {type === 'live' && item.isLive ? <span className="soop-card__live-badge">LIVE</span> : null}
        {item.duration ? <span className="soop-card__duration">{item.duration}</span> : null}
      </span>

      <span className="soop-card__body">
        <strong className="soop-card__title">{item.title}</strong>
        <span className="soop-card__meta">
          {type === 'live' ? `${formatViewerCount(item.viewerCount)}명 시청 중` : item.createdAt}
        </span>
      </span>
    </button>
  );
}

function MediaModal({ item, type, onClose }) {
  const embedInfo = useMemo(() => getMediaEmbedInfo(item.url), [item.url]);

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
    <div className="media-modal" role="dialog" aria-modal="true" aria-label={`${item.title} 플레이어`}>
      <button type="button" className="media-modal__backdrop" onClick={onClose} aria-label="모달 닫기" />

      <div className={`media-modal__panel ${type === 'shorts' ? 'is-shorts' : ''}`}>
        <div className="media-modal__head">
          <strong>{item.title}</strong>
          <button type="button" className="media-modal__close" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="media-modal__player">
          {embedInfo.canEmbed ? (
            <iframe
              title={item.title}
              src={embedInfo.embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="media-modal__fallback">
              <p>이 URL은 임베드 규칙을 확인할 수 없어 직접 열기로 제공합니다.</p>
              <a href={embedInfo.fallbackUrl} target="_blank" rel="noreferrer">
                새 창에서 보기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaTabs;
