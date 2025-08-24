import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';
import { QRCodeModal } from '../components/QRCodeModal';

const API_URL = "http://localhost:4000";

interface Product {
  id: number;
  name: string;
}

const Producer: React.FC = () => {
  const { userAddress, isCorrectNetwork } = useWallet();
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchMyProducts = useCallback(async () => {
    if (!userAddress || !isCorrectNetwork) return;
    try {
      const response = await fetch(`${API_URL}/api/products?owner=${userAddress}`);
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setMyProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Could not fetch your products.");
    }
  }, [userAddress, isCorrectNetwork]);

  useEffect(() => {
    if (isCorrectNetwork) {
      fetchMyProducts();
    }
  }, [fetchMyProducts, isCorrectNetwork]);

  const handleRegisterProduct = async () => {
    if (!productName) return toast.error('Please enter a product name.');
    if (!isCorrectNetwork) return toast.error('Please switch to the Fuji Testnet.');

    setLoading(true);
    toast.loading('Registering product...', { id: 'register' });

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName }),
      });
      if (!response.ok) throw new Error('Failed to create product on server.');
      toast.success('Product registered successfully!', { id: 'register' });
      setProductName('');
      fetchMyProducts();
    } catch (error) {
      toast.error('Failed to register product.', { id: 'register' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const getProductUrl = (productId: number) => `${window.location.origin}/verify/${productId}`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {selectedProduct && (
        <QRCodeModal 
          url={getProductUrl(selectedProduct.id)}
          productName={selectedProduct.name}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Producer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Register New Product</h2>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Organic Tomatoes"
            disabled={!isCorrectNetwork}
          />
          <button
            onClick={handleRegisterProduct}
            disabled={loading || !isCorrectNetwork}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Registering...' : 'Register Product'}
          </button>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">My Products</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {myProducts.length > 0 ? (
              myProducts.map((product) => (
                <div key={product.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-gray-500">Product ID: {product.id}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(product)} className="text-sm text-green-600 hover:underline">Show QR Code</button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">You haven't registered any products yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Producer;