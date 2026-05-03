import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, CheckCircle, AlertCircle, Droplets, Sun, Shield, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DiagnosticResult {
  skinType: string;
  healthScore: number;
  recommendations: string[];
}

export default function AIScanner() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

const startScan = useCallback(async () => {
    if (!image) return;
    setIsScanning(true);

    try {
      const base64Image = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Tu es un dermatologue expert. Analyse cette photo de peau et réponds UNIQUEMENT en JSON valide avec exactement cette structure:
{
  "skinType": "type de peau en français (ex: Normale, Grasse, Sèche, Mixte, Sensible)",
  "healthScore": nombre entre 0 et 100,
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3", "recommandation 4"]
}
Aucun texte avant ou après le JSON.`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const aiResult = JSON.parse(clean);

      setResult(aiResult);

      if (user) {
        try {
          await fetch('/api/diagnostics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              image_url: image.substring(0, 100),
              skin_type: aiResult.skinType,
              health_score: aiResult.healthScore,
              recommendations: { items: aiResult.recommendations }
            })
          });
        } catch (err) {
          console.error('Failed to save diagnostic:', err);
        }
      }
    } catch (err) {
      console.error('AI scan failed:', err);
      alert('Erreur lors de l\'analyse. Réessayez.');
    } finally {
      setIsScanning(false);
    }
  }, [image, user]);

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsScanning(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <section className="py-20 px-4" id="scanner">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Scanner IA Dermatologique
          </h2>
          <p className="text-secondary max-w-xl mx-auto">
            Téléchargez une photo de votre peau et laissez notre IA analyser
            votre type de peau et vous donner des recommandations personnalisées.
          </p>
          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm">
              <LogIn className="w-4 h-4" />
              <Link to="/auth" className="hover:underline">Connectez-vous</Link> pour sauvegarder vos diagnostics
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all overflow-hidden ${
                image ? 'border-primary bg-primary/5' : 'border-border bg-muted/50 hover:border-primary/50'
              }`}
            >
              {!image ? (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Télécharger une photo</p>
                  <p className="text-sm text-secondary">ou glisser-déposer ici</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <>
                  <img
                    src={image}
                    alt="Uploaded skin"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/30">
                      <div className="scan-line" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-4 border-primary pulse-ring absolute inset-0" />
                          <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center bg-black/50">
                            <Camera className="w-10 h-10 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isScanning && (
                    <button
                      onClick={reset}
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                </>
              )}
            </div>

            {image && !result && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={startScan}
                disabled={isScanning}
                className="w-full mt-4 py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isScanning ? 'Analyse en cours...' : 'Lancer l\'analyse'}
              </motion.button>
            )}
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Analyse terminée</h3>
                      <p className="text-sm text-secondary">Résultats personnalisés</p>
                    </div>
                  </div>

                  {/* Skin Type */}
                  <div className="mb-6 p-4 bg-muted rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Droplets className="w-5 h-5 text-primary" />
                      <span className="text-sm text-secondary">Type de peau</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{result.skinType}</p>
                  </div>

                  {/* Health Score */}
                  <div className="mb-6 p-4 bg-muted rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-sm text-secondary">Score de santé</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <p className={`text-4xl font-bold ${getScoreColor(result.healthScore)}`}>
                        {result.healthScore}
                      </p>
                      <span className="text-secondary mb-1">/ 100</span>
                    </div>
                    <div className="mt-3 h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.healthScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Sun className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">Recommandations</span>
                    </div>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-secondary">{rec}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {!user && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <p className="text-sm text-center text-secondary">
                        <Link to="/auth" className="text-primary font-medium hover:underline">Créez un compte</Link> pour sauvegarder et suivre vos diagnostics
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-8 bg-muted/50 rounded-3xl border-2 border-dashed border-border"
                >
                  <AlertCircle className="w-16 h-16 text-secondary/50 mb-4" />
                  <p className="text-secondary text-center">
                    Téléchargez une photo pour commencer l'analyse de votre peau
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
