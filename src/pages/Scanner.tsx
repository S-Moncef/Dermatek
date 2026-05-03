import AIScanner from '../components/AIScanner';
import { motion } from 'framer-motion';

export default function Scanner() {
  return (
    <main className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Diagnostic IA
          </h1>
          <p className="text-secondary max-w-xl mx-auto">
            Analysez votre peau en quelques secondes avec notre technologie
            d'intelligence artificielle de pointe.
          </p>
        </motion.div>
      </div>
      <AIScanner />
    </main>
  );
}
