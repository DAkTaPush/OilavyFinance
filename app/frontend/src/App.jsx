import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import AddTransactionModal from './components/AddTransactionModal';
import Home from './pages/Home';
import Transaction from './pages/Transaction';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Loader from './components/Loader';

const AppContent = () => {
  const { ready } = useAuth();
  const [modal, setModal] = useState(null); // null | { type: 'expense'|'income'|'transfer' }
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = (type = 'expense') => setModal({ type });
  const closeModal = () => setModal(null);
  const handleSaved = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <Routes>
        <Route path="/"            element={<Home key={refreshKey} onAddTransaction={openModal} />} />
        <Route path="/transaction" element={<Transaction key={refreshKey} onAddTransaction={openModal} />} />
        <Route path="/analytics"   element={<Analytics />} />
        <Route path="/profile"     element={<Profile />} />
      </Routes>

      <BottomNav />

      {modal && (
        <AddTransactionModal
          initialType={modal.type}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
