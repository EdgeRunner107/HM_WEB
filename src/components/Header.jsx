import { navigationItems } from '../data/mockData';

function Header({ activePage, onNavigate, siteAssets }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="site-brand" type="button" onClick={() => onNavigate('home')}>
          <span className="site-brand__mark">
            <img src={siteAssets.logoImage} alt="사이트 로고" className="site-brand__logo" />
          </span>
          <span className="site-brand__text">
            <span className="site-brand__title">HM</span>
        
          </span>
        </button>

        <nav className="site-nav" aria-label="주요  메뉴">
          {navigationItems.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`site-nav__link ${activePage === item.page ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
