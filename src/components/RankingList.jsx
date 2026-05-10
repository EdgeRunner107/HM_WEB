function RankingList({ title, description, items }) {
  return (
    <section className="ranking-panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-head__title">{title}</h3>
          <p className="panel-head__description">{description}</p>
        </div>
        <div className="panel-head__meta">총 {items.length}개 항목</div>
      </div>

      <div className="ranking-list">
        {items.map((item) => {
          const topClass =
            item.rank === 1 ? 'is-top-1' : item.rank === 2 ? 'is-top-2' : item.rank === 3 ? 'is-top-3' : '';

          return (
            <article key={`${title}-${item.rank}-${item.name}`} className={`ranking-item ${topClass}`}>
              <div className="ranking-item__rank">
                <span className="ranking-item__rank-badge">{item.rank}</span>
                <span className="ranking-item__rank-text">위</span>
              </div>

              <div>
                <div className="ranking-item__name">{item.name}</div>
                <div className="ranking-item__description">{item.description}</div>
              </div>

              <div className="status-chip">{item.status}</div>

              <div className="ranking-item__score">
                <span className="ranking-item__score-value">{item.score}</span>
                <span className="ranking-item__score-label">{item.scoreLabel}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RankingList;
