import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-secondary capitalize">
            {product.category}
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
            onClick={() => onAddToCart(product.id)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Acheter
          </button>
        </div>
      </div>
    </motion.div>
  );
}
