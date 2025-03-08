
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section id="hero-section" className="hero-section">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-4 font-playfair">Amrutas Art Gallery</h1>
          <p className="text-xl mb-8">
            Discover unique handmade artworks from talented artists around the world.
            Each piece tells a story and brings beauty to your space.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/products">Browse Collection</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
