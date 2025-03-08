import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const categories = [
  {
    name: "Paintings",
    description: "Beautiful hand-painted artworks",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Sculptures",
    description: "3D art pieces for your collection",
    image: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Pottery",
    description: "Handcrafted ceramic artworks",
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

export default function FeaturedCategories() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div key={category.name} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-64 object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
            <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
            <p className="text-sm mb-4 opacity-90">{category.description}</p>
            <Button asChild variant="outline" className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20">
              <Link href={`/products?category=${category.name}`}>
                Browse {category.name}
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}