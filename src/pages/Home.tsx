import Hero from '../components/Hero';
import AIScanner from '../components/AIScanner';
import RoutineSection from '../components/RoutineSection';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main>
      <Hero />
      <AIScanner />
      <RoutineSection />

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-3 gap-8"
          >
            {[
              { icon: Users, value: '50,000+', label: 'Utilisateurs satisfaits' },
              { icon: Star, value: '4.9/5', label: 'Note moyenne' },
              { icon: Award, value: '98%', label: 'Précision IA' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white rounded-3xl border border-border shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-secondary">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Prêt à découvrir votre peau?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui ont transformé leur routine
              de soins grâce à DERMATEK.
            </p>
            <Link
              to="/scanner"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-white">DERMATEK</span>
            </div>
            <p className="text-white/60 text-sm">
              © 2024 DERMATEK. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
