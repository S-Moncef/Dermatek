import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, History, Package, ChevronRight, Loader2, Calendar, TrendingUp, Camera, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Diagnostic {
  id: number;
  created_at: string;
  skin_type: string;
  health_score: number;
  recommendations: { items: string[] } | string[];
  image_url: string;
}

interface Order {
  id: number;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'orders'>('diagnostics');
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const userId = user?.id || 'demo';
      const [diagRes, ordersRes] = await Promise.all([
        fetch(`/api/diagnostics?user_id=${userId}`),
        fetch(`/api/orders?user_id=${userId}`)
      ]);
      const [diagData, ordersData] = await Promise.all([
        diagRes.json(),
        ordersRes.json()
      ]);
      setDiagnostics(Array.isArray(diagData) ? diagData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      processing: 'bg-primary/10 text-primary',
      shipped: 'bg-blue-100 text-blue-600',
      delivered: 'bg-success/10 text-success',
    };
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Connexion requise</h1>
          <p className="text-secondary mb-8">
            Connectez-vous pour accéder à votre espace personnel, suivre vos diagnostics et gérer vos commandes.
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
    <main className="pt-20 min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mon Espace</h1>
            <p className="text-secondary">{user.email}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm text-secondary">Diagnostics</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{diagnostics.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm text-secondary">Commandes</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-secondary">Score moyen</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {diagnostics.length > 0
                ? Math.round(diagnostics.reduce((sum, d) => sum + d.health_score, 0) / diagnostics.length)
                : '-'}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-primary text-white'
                : 'bg-white text-secondary hover:bg-muted border border-border'
            }`}
          >
            <History className="w-5 h-5" />
            Historique Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-primary text-white'
                : 'bg-white text-secondary hover:bg-muted border border-border'
            }`}
          >
            <Package className="w-5 h-5" />
            Mes Commandes
          </button>
        </div>

        {/* Content */}
        {activeTab === 'diagnostics' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Diagnostics List */}
            <div className="space-y-4">
              {diagnostics.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border p-8 text-center">
                  <Camera className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                  <p className="text-secondary mb-4">Aucun diagnostic effectué</p>
                  <Link
                    to="/scanner"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Faire un diagnostic
                  </Link>
                </div>
              ) : (
                diagnostics.map((diag, i) => (
                  <motion.button
                    key={diag.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedDiagnostic(diag)}
                    className={`w-full text-left p-4 bg-white rounded-2xl border-2 transition-all ${
                      selectedDiagnostic?.id === diag.id
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{diag.health_score}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Type: {diag.skin_type}</p>
                          <div className="flex items-center gap-1 text-sm text-secondary">
                            <Calendar className="w-4 h-4" />
                            {formatDate(diag.created_at)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary" />
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Diagnostic Detail */}
            <div>
              {selectedDiagnostic ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-border shadow-sm p-6 sticky top-24"
                >
                  <h3 className="font-bold text-foreground text-lg mb-4">Détails du diagnostic</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-2xl">
                      <p className="text-sm text-secondary mb-1">Type de peau</p>
                      <p className="text-xl font-bold text-foreground">{selectedDiagnostic.skin_type}</p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-2xl">
                      <p className="text-sm text-secondary mb-1">Score de santé</p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-primary">{selectedDiagnostic.health_score}</p>
                        <span className="text-secondary mb-1">/ 100</span>
                      </div>
                      <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${selectedDiagnostic.health_score}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-secondary mb-3">Recommandations</p>
                      <ul className="space-y-2">
                        {(() => {
  const r = selectedDiagnostic.recommendations;
  if (Array.isArray(r)) return r;
  if (typeof r === 'string') { try { const p = JSON.parse(r); return Array.isArray(p) ? p : p?.items || []; } catch { return []; } }
  return (r as any)?.items || [];
})().map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-primary">{i + 1}</span>
                            </div>
                            <span className="text-secondary text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-muted/50 rounded-3xl border-2 border-dashed border-border p-8 text-center h-full flex flex-col items-center justify-center">
                  <History className="w-12 h-12 text-secondary/30 mb-4" />
                  <p className="text-secondary">Sélectionnez un diagnostic pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center">
                <Package className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                <p className="text-secondary mb-4">Aucune commande passée</p>
                <Link
                  to="/boutique"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Voir la boutique
                </Link>
              </div>
            ) : (
              orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-border p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-foreground">Commande #{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-secondary">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{order.total.toLocaleString()} DZD</p>
                      <p className="text-sm text-secondary capitalize">
                        {order.payment_method === 'cod' ? 'Paiement à la livraison' : 'Carte CIB/Edahabia'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
