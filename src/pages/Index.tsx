import { Link } from "react-router-dom";
import SupportBanner from "@/components/SupportBanner";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, UtensilsCrossed, Star, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FloatingFoodDecor from "@/components/FloatingFoodDecor";
import restaurantHero from "@/assets/restaurant-hero.jpg";

export default function Index() {
  const features = [
    { icon: MapPin, title: "Interactive Floor Map", desc: "Choose your exact table from our live restaurant layout" },
    { icon: UtensilsCrossed, title: "Pre-Order Menu", desc: "Browse and pre-order to skip the wait on arrival" },
    { icon: Clock, title: "Instant Confirmation", desc: "Real-time booking status updates and smart reminders" },
    { icon: Shield, title: "Allergy Safe", desc: "Tag dietary requirements so the kitchen is prepared" },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark relative">
      <Navbar />

      {/* Hero — two-column on desktop, stacked on mobile */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: copy + CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm text-primary tracking-widest uppercase font-medium">Premium Dining Experience</span>
                <Star className="h-4 w-4 text-primary fill-primary" />
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Your Table
                <br />
                <span className="text-gradient-gold">Awaits</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 mb-10">
                Reserve your perfect dining experience. Choose your table, pre-order your favorites, and arrive to perfection.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/book">
                  <Button size="lg" className="bg-gradient-gold text-primary-foreground font-semibold h-14 px-8 text-lg gap-2 glow-gold">
                    <CalendarDays className="h-5 w-5" />
                    Reserve Now
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-primary/30 text-foreground hover:bg-primary/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: interactive 3D scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-[55vh] md:h-[70vh] w-full"
            >
              <HeroScene />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Decorative floating food on non-hero sections */}
      <div className="relative">
        <FloatingFoodDecor />

        {/* Features */}
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                A Seamless <span className="text-gradient-gold">Booking Experience</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Everything you need to plan the perfect evening, right from your screen.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-xl p-6 text-center hover:glow-gold transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="glass-card rounded-2xl p-12 glow-gold max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Ready for an <span className="text-gradient-gold">Unforgettable Evening</span>?
              </h2>
              <p className="text-muted-foreground mb-8">
                Book your table in under 60 seconds. It's that easy.
              </p>
              <Link to="/book">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground font-semibold h-14 px-10 text-lg">
                  Book Your Table
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 relative z-10">
          <div className="container mx-auto px-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                <span className="font-heading">Easy<span className="text-primary">Dine</span></span>
              </div>
              <p>© 2026 EasyDine. All rights reserved.</p>
            </div>
            <SupportBanner />
          </div>
        </footer>
      </div>
    </div>
  );
}
