import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword } from "./utils"; // Assuming this function exists

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

function ensureAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  console.log("Admin access denied. User:", req.user);
  res.status(403).send("Forbidden");
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Analytics routes
  app.get("/api/analytics/revenue", ensureAdmin, async (req, res) => {
    const revenueData = await storage.getRevenueOverTime(7); // Last 7 days
    res.json(revenueData);
  });

  app.get("/api/analytics/order-status", ensureAdmin, async (req, res) => {
    const orderStatusData = await storage.getOrderStatusBreakdown();
    res.json(orderStatusData);
  });

  app.get("/api/analytics/summary", ensureAdmin, async (req, res) => {
    const summary = await storage.getAnalyticsSummary();
    res.json(summary);
  });

  // Products routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product || product.stockQuantity <=0) return res.status(404).send("Product not found or out of stock"); //Added stock check
    res.json(product);
  });

  app.post("/api/products", ensureAdmin, async (req, res) => {
    try {
      const productData = {
        ...req.body,
        price: req.body.price.toString(), // Convert to string for decimal type
        stockQuantity: Number(req.body.stockQuantity),
        isAvailable: req.body.stockQuantity > 0 //isAvailable based on stock
      };
      const product = insertProductSchema.parse(productData);
      const created = await storage.createProduct(product);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Product creation error:', error);
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  });

  app.patch("/api/products/:id", ensureAdmin, async (req, res) => {
    const updated = await storage.updateProduct(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/products/:id", ensureAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // Cart routes - not accessible to admin users
  app.get("/api/cart", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot access cart functionality");
    }
    const items = await storage.getCartItems(req.user.id);
    res.json(items);
  });

  app.post("/api/cart", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot access cart functionality");
    }
    const schema = z.object({
      productId: z.number(),
      quantity: z.number().min(1),
    });

    const { productId, quantity } = schema.parse(req.body);
    const item = await storage.addToCart({
      userId: req.user.id,
      productId,
      quantity,
    });
    res.status(201).json(item);
  });

  app.patch("/api/cart/:productId", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot access cart functionality");
    }
    const schema = z.object({ quantity: z.number().min(1) });
    const { quantity } = schema.parse(req.body);

    const updated = await storage.updateCartItem(
      req.user.id,
      Number(req.params.productId),
      quantity,
    );

    if (!updated) return res.status(404).send("Cart item not found");
    res.json(updated);
  });

  app.delete("/api/cart/:productId", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot access cart functionality");
    }
    await storage.removeFromCart(req.user.id, Number(req.params.productId));
    res.sendStatus(204);
  });

  // Orders routes
  app.get("/api/orders", ensureAuthenticated, async (req, res) => {
    const orders = await storage.getUserOrders(req.user.id);
    res.json(orders);
  });

  app.post("/api/orders", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot create orders");
    }
    const order = await storage.createOrder({
      userId: req.user.id,
      status: "pending",
      totalAmount: req.body.totalAmount,
      createdAt: new Date(),
    });

    await storage.clearCart(req.user.id);
    res.status(201).json(order);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    // Create user and generate OTP
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    const otp = await storage.createOTP(user.id, "registration", 10);

    req.login(user, (err) => {
      if (err) return next(err);
      // Return OTP in response (in a real app, you'd send via email/SMS)
      res.status(201).json({ ...user, registrationOtp: otp });
    });
  });

  app.post("/api/verify-otp", ensureAuthenticated, async (req, res) => {
    const { code, purpose } = req.body;
    const isValid = await storage.verifyOTP(req.user.id, code, purpose);

    if (isValid) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  });

  app.post("/api/generate-checkout-otp", ensureAuthenticated, async (req, res) => {
    if (req.user.isAdmin) {
      return res.status(403).send("Admin users cannot access checkout functionality");
    }
    
    const otp = await storage.createOTP(req.user.id, "checkout", 5);
    // In a real app, this would trigger an SMS or email
    // For demo purposes, we return the OTP in the response
    res.status(200).json({ success: true, code: otp });
  });


  const httpServer = createServer(app);
  return httpServer;
}