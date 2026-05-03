import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export default function RoutineSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter des produits au panier');
      return;
    }
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, product_id: productId, quantity: 1 })
      });
      alert('Produit ajouté au panier!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const morningProducts = products.filter(p => p.category === 'cleanser' || p.category === 'moisturizer' || p.category === 'sunscreen');
  const eveningProducts = products.filter(p => p.category === 'serum' || p.category === 'treatment');

  const displayProducts = activeTab === 'morning' ? morningProducts : eveningProducts;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Routine Personnalisée
          </h2>
          <p className="text-secondary max-w-xl mx-auto">
            Découvrez les produits adaptés à votre type de peau pour une routine
            matin et soir optimale.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-white rounded-2xl shadow-sm border border-border">
            <button
              onClick={() => setActiveTab('morning')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'morning'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              <Sun className="w-5 h-5" />
              Matin
            </button>
            <button
              onClick={() => setActiveTab('evening')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'evening'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              <Moon className="w-5 h-5" />
              Soir
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 text-secondary">
            Aucun produit disponible pour cette routine.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.slice(0, 3).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl border border-border shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary">
                      {activeTab === 'morning' ? 'Routine Matin' : 'Routine Soir'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground text-lg mb-2">{product.name}</h3>
                  <p className="text-secondary text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toLocaleString()} DZD
                    </span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Acheter
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
