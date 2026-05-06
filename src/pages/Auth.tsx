import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle, Scan, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
            <Scan className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-secondary mt-2">
            {isSignUp
              ? 'Rejoignez DERMATEK pour suivre votre peau'
              : 'Accédez à votre espace personnel'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-border shadow-xl p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-danger/10 text-danger rounded-xl mb-6"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-secondary mt-2">Minimum 6 caractères</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  {isSignUp ? "S'inscrire" : 'Se connecter'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>


          {/* Toggle */}
          <p className="text-center text-secondary mt-6">
            {isSignUp ? 'Déjà un compte?' : "Pas encore de compte?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>

      </motion.div>
    </main>
  );
}
