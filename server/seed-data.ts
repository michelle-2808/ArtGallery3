
import { db } from "./db";
import { products } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with initial products...");
  
  try {
    // Check if we already have products
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length > 0) {
      console.log("Database already contains products. Skipping seed.");
      return;
    }
    
    // Add sample products
    const sampleProducts = [
      {
        title: "Abstract Painting",
        description: "A beautiful abstract painting with vibrant colors",
        price: "95.99",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "painting",
        stockQuantity: 5,
        isAvailable: true
      },
      {
        title: "Ceramic Vase",
        description: "Handcrafted ceramic vase with unique patterns",
        price: "45.50",
        imageUrl: "https://images.unsplash.com/photo-1578913685467-ef49f9c224b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "pottery",
        stockQuantity: 8,
        isAvailable: true
      },
      {
        title: "Wooden Sculpture",
        description: "Hand-carved wooden sculpture from sustainable wood",
        price: "120.00",
        imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "sculpture",
        stockQuantity: 3,
        isAvailable: true
      },
      {
        title: "Digital Art Print",
        description: "Limited edition digital art print, signed by the artist",
        price: "35.99",
        imageUrl: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "print",
        stockQuantity: 15,
        isAvailable: true
      },
      {
        title: "Glass Ornament",
        description: "Handblown glass ornament with delicate details",
        price: "28.50",
        imageUrl: "https://images.unsplash.com/photo-1576020886878-f8fc1a748678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "glass",
        stockQuantity: 7,
        isAvailable: true
      },
      {
        title: "Metal Wall Art",
        description: "Modern metal wall art, perfect for contemporary spaces",
        price: "75.00",
        imageUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80",
        category: "sculpture",
        stockQuantity: 4,
        isAvailable: true
      }
    ];
    
    // Insert sample products into the database
    await db.insert(products).values(sampleProducts);
    
    console.log("Database seeded successfully with initial products!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to seed database:", error);
      process.exit(1);
    });
}

export { seedDatabase };
