import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import SectionTitle from './components/SectionTitle';
import MemberGrid from './components/MemberGrid';
import { getEmbedUrl } from './components/VideoSection';
import MediaTabs from './components/MediaTabs';
import AdminPage from './components/AdminPage';
import { getSignatureImage, memberItems, signatureItems, siteAssets } from './data/mockData';

function App() {
  const isAdminPath = window.location.pathname === '/admin';
  const [activePage, setActivePage] = useState('home');
  const [modalVideo, setModalVideo] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  if (isAdminPath) {
    return (
      <div
        className="site-shell"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 10, 15, 0.68), rgba(8, 10, 15, 0.96)), url(${siteAssets.backgroundImage})`,
        }}
      >
        <AdminPage />
      </div>
    );
  }

  const handleNavigate = (page) => {
    setActivePage(page);
    setModalVideo(null);
  };

  return (
    <div
      className="site-shell"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8, 10, 15, 0.68), rgba(8, 10, 15, 0.96)), url(${siteAssets.backgroundImage})`,
      }}
    >
      <Header activePage={activePage} onNavigate={handleNavigate} siteAssets={siteAssets} />

      <main className="page-shell">
        {activePage === 'home' ? <HomePage onOpenVideo={setModalVideo} onNavigate={handleNavigate} /> : null}
        {activePage === 'members' ? <MembersPage /> : null}
        {activePage === 'signatures' ? <SignaturesPage onOpenVideo={setModalVideo} /> : null}
      </main>

      {modalVideo ? <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} /> : null}
    </div>
  );
}

function HomePage({ onOpenVideo, onNavigate }) {
  return (
    <>
     

      <MediaTabs />

      <section className="quick-page-grid">
      
      </section>
    </>
  );
}

function MembersPage() {
  const [members, setMembers] = useState(memberItems);

  useEffect(() => {
    let isMounted = true;

    fetch('https://hm-web-back.onrender.com/afbjs')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load members');
        }

        return response.json();
      })
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) {
          return;
        }

        setMembers(
          data
            .map(([id, name, profileImage, href]) => ({
              id,
              name,
              profileImage,
              href,
            }))
            .sort((left, right) => left.id - right.id)
        );
      })
      .catch(() => {
        if (isMounted) {
          setMembers(memberItems);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page-section">
      <SectionTitle
        eyebrow="멤버목록"
        title=""
        description=""
      />
      <MemberGrid members={members} />
    </section>
  );
}

function SignaturesPage({ onOpenVideo }) {
  const [signatures, setSignatures] = useState(signatureItems);

  useEffect(() => {
    let isMounted = true;

    fetch('https://hm-web-back.onrender.com/hm-signature')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load signatures');
        }

        return response.json();
      })
      .then((data) => {
        if (!isMounted || !Array.isArray(data)) {
          return;
        }

        setSignatures(
          data.map(([id, fileName, imagePath, url]) => ({
            id,
            title: fileName.replace(/\.[^.]+$/, ''),
            image: getSignatureImage(imagePath, fileName),
            url,
          }))
        );
      })
      .catch(() => {
        if (isMounted) {
          setSignatures(signatureItems);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page-section">
      <SectionTitle
        eyebrow="시그니처"
        title=""
        description=""
      />

      <div className="signature-grid">
        {signatures.map((item) => (
          <button
            key={item.id}
            type="button"
            className="signature-card"
            disabled={!item.url}
            onClick={() => item.url && onOpenVideo(item)}
          >
            <img src={item.image} alt={item.title} className="signature-card__image" loading="lazy" />
            <span className="signature-card__title">{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function VideoModal({ video, onClose }) {
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
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${video.title} 영상`}>
      <button type="button" className="video-modal__backdrop" onClick={onClose} aria-label="모달 닫기" />
      <div className="video-modal__panel">
        <div className="video-modal__head">
          <strong>{video.title}</strong>
          <button type="button" className="video-modal__close" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="video-modal__frame">
          <iframe
            title={video.title}
            src={getEmbedUrl(video.url)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default App;
