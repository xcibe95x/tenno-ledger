import { useState } from 'react';
import { useStore } from './store.jsx';
import Header from './components/Header.jsx';
import Collection from './components/Collection.jsx';
import FarmPlanner from './components/FarmPlanner.jsx';
import KeepList from './components/KeepList.jsx';
import Settings from './components/Settings.jsx';

const TABS = [
  { key: 'collection', label: 'Collection', el: <Collection /> },
  { key: 'farm', label: 'Farm planner', el: <FarmPlanner /> },
  { key: 'keep', label: 'Keep list', el: <KeepList /> },
  { key: 'settings', label: 'Settings', el: <Settings /> },
];

export default function App() {
  const { items } = useStore();
  // Tab is kept in the URL hash so views are bookmarkable (#farm, #keep, ...)
  const initial = window.location.hash.slice(1);
  const [tab, setTabState] = useState(TABS.some(t => t.key === initial) ? initial : 'collection');
  const setTab = (key) => {
    window.location.hash = key;
    setTabState(key);
  };

  return (
    <div className="app">
      <Header />
      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map(t => (
          <button
            key={t.key} role="tab" aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main>
        {items === null
          ? <p className="empty">Loading item database…</p>
          : TABS.find(t => t.key === tab)?.el}
      </main>
      <footer className="foot">
        Not affiliated with Digital Extremes. Data: WFCD warframe-items · images: cdn.warframestat.us
      </footer>
    </div>
  );
}
