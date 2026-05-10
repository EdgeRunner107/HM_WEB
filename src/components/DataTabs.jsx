import { dataTabs } from '../data/mockData';

function DataTabs({ activeTab, onChange }) {
  return (
    <div className="data-tabs" role="tablist" aria-label="데이터 탭">
      {dataTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`data-tabs__button ${activeTab === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default DataTabs;
