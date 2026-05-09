import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Loader2, ArrowRight, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  id: number;
  quantity: number;
  products: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    wilaya: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart?user_id=${user?.id || 'demo'}`);
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity })
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const shipping = total > 5000 ? 0 : 500;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const items = cartItems.map(item => ({
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price
      }));

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'demo',
          items,
          total: total + shipping,
          payment_method: paymentMethod,
          shipping_address: `${formData.address}, ${formData.wilaya}`,
          phone: formData.phone
        })
      });

      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          items: cartItems.map(item => ({
            name: item.products.name,
            quantity: item.quantity,
            price: item.products.price
          })),
          address: formData.address,
          phone: formData.phone,
          wilaya: formData.wilaya,
          total: total + shipping,
          payment_method: paymentMethod
        })
      });

      alert('Commande passée avec succès!');
      setShowCheckout(false);
      fetchCart();
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Erreur lors de la commande');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Connexion requise</h1>
          <p className="text-secondary mb-8">
            Connectez-vous pour accéder à votre panier et passer des commandes.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Se connecter
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mon Panier
          </h1>
          <p className="text-secondary">
            {cartItems.length} article{cartItems.length !== 1 ? 's' : ''} dans votre panier
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="w-20 h-20 text-secondary/30 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Votre panier est vide</h2>
            <p className="text-secondary mb-6">Découvrez nos produits et commencez vos achats!</p>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
            >
              Voir la boutique
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm"
                >
                  <img
                    src={item.products?.image_url}
                    alt={item.products?.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.products?.name}</h3>
                    <p className="text-primary font-bold mt-1">
                      {item.products?.price?.toLocaleString()} DZD
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-border transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-border transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-secondary hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-border shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-foreground mb-6">Résumé</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-secondary">
                    <span>Sous-total</span>
                    <span>{total.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuite' : `${shipping} DZD`}</span>
                  </div>
                  {total < 5000 && (
                    <p className="text-xs text-secondary bg-muted p-3 rounded-xl">
                      Livraison gratuite à partir de 5,000 DZD
                    </p>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-lg">
                    <span>Total</span>
                    <span className="text-primary">{(total + shipping).toLocaleString()} DZD</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors"
                  >
                    Passer la commande
                  </button>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-4">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Mode de paiement
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Truck className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-primary' : 'text-secondary'}`} />
                          <span className="text-xs font-medium">À la livraison</span>
                        </button>

                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Wilaya
                      </label>
                      <select
  value={formData.wilaya}
  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
  required
  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
>
  <option value="">Sélectionner...</option>
  <option value="Adrar">01 - Adrar</option>
  <option value="Chlef">02 - Chlef</option>
  <option value="Laghouat">03 - Laghouat</option>
  <option value="Oum El Bouaghi">04 - Oum El Bouaghi</option>
  <option value="Batna">05 - Batna</option>
  <option value="Béjaïa">06 - Béjaïa</option>
  <option value="Biskra">07 - Biskra</option>
  <option value="Béchar">08 - Béchar</option>
  <option value="Blida">09 - Blida</option>
  <option value="Bouira">10 - Bouira</option>
  <option value="Tamanrasset">11 - Tamanrasset</option>
  <option value="Tébessa">12 - Tébessa</option>
  <option value="Tlemcen">13 - Tlemcen</option>
  <option value="Tiaret">14 - Tiaret</option>
  <option value="Tizi Ouzou">15 - Tizi Ouzou</option>
  <option value="Alger">16 - Alger</option>
  <option value="Djelfa">17 - Djelfa</option>
  <option value="Jijel">18 - Jijel</option>
  <option value="Sétif">19 - Sétif</option>
  <option value="Saïda">20 - Saïda</option>
  <option value="Skikda">21 - Skikda</option>
  <option value="Sidi Bel Abbès">22 - Sidi Bel Abbès</option>
  <option value="Annaba">23 - Annaba</option>
  <option value="Guelma">24 - Guelma</option>
  <option value="Constantine">25 - Constantine</option>
  <option value="Médéa">26 - Médéa</option>
  <option value="Mostaganem">27 - Mostaganem</option>
  <option value="M'Sila">28 - M'Sila</option>
  <option value="Mascara">29 - Mascara</option>
  <option value="Ouargla">30 - Ouargla</option>
  <option value="Oran">31 - Oran</option>
  <option value="El Bayadh">32 - El Bayadh</option>
  <option value="Illizi">33 - Illizi</option>
  <option value="Bordj Bou Arréridj">34 - Bordj Bou Arréridj</option>
  <option value="Boumerdès">35 - Boumerdès</option>
  <option value="El Tarf">36 - El Tarf</option>
  <option value="Tindouf">37 - Tindouf</option>
  <option value="Tissemsilt">38 - Tissemsilt</option>
  <option value="El Oued">39 - El Oued</option>
  <option value="Khenchela">40 - Khenchela</option>
  <option value="Souk Ahras">41 - Souk Ahras</option>
  <option value="Tipaza">42 - Tipaza</option>
  <option value="Mila">43 - Mila</option>
  <option value="Aïn Defla">44 - Aïn Defla</option>
  <option value="Naâma">45 - Naâma</option>
  <option value="Aïn Témouchent">46 - Aïn Témouchent</option>
  <option value="Ghardaïa">47 - Ghardaïa</option>
  <option value="Relizane">48 - Relizane</option>
  <option value="Timimoun">49 - Timimoun</option>
  <option value="Bordj Badji Mokhtar">50 - Bordj Badji Mokhtar</option>
  <option value="Ouled Djellal">51 - Ouled Djellal</option>
  <option value="Béni Abbès">52 - Béni Abbès</option>
  <option value="In Salah">53 - In Salah</option>
  <option value="In Guezzam">54 - In Guezzam</option>
  <option value="Touggourt">55 - Touggourt</option>
  <option value="Djanet">56 - Djanet</option>
  <option value="El M'Ghair">57 - El M'Ghair</option>
  <option value="El Meniaa">58 - El Meniaa</option>
</select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Adresse complète
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={2}
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="Rue, quartier, commune..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="0X XX XX XX XX"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'Confirmer la commande'
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
