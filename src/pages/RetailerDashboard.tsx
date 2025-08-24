import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext';

const API_URL = "http://localhost:4000";

interface Product {
  id: number;
  name: string;
}

const Retailer: React.FC = () => {
  const { isCorrectNetwork } = useWallet();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAllProducts = useCallback(async () => {
    if (!isCorrectNetwork) return;
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Failed to fetch all products:", error);
    }
  }, [isCorrectNetwork]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleAddUpdate = async () => {
    if (!selectedProductId || !status || !location) return toast.error('Please fill all fields.');
    setLoading(true);
    toast.loading('Adding update...', { id: 'update' });
    try {
      const response = await fetch(`${API_URL}/api/products/${selectedProductId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location }),
      });
      if (!response.ok) throw new Error('Server error');
      toast.success('Update added successfully!', { id: 'update' });
    } catch (error) {
      toast.error('Failed to add update.', { id: 'update' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Retailer Dashboard</h1>
      <div className="bg-white/50 backdrop-blur-md p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Add Product Update</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select onChange={(e) => setSelectedProductId(e.target.value)} disabled={!isCorrectNetwork} className="p-2 border rounded">
            <option value="">Select a Product</option>
            {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
          </select>
          <input type="text" placeholder="Status (e.g., In Storage)" onChange={(e) => setStatus(e.target.value)} disabled={!isCorrectNetwork} className="p-2 border rounded" />
          <input type="text" placeholder="Location (e.g., Hyderabad Warehouse)" onChange={(e) => setLocation(e.target.value)} disabled={!isCorrectNetwork} className="p-2 border rounded" />
        </div>
        <button onClick={handleAddUpdate} disabled={loading || !isCorrectNetwork} className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Submitting...' : 'Add Update'}
        </button>
      </div>
    </div>
  );
};

export default Retailer;