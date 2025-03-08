import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

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
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  });

  app.post("/api/products", ensureAdmin, async (req, res) => {
    const product = insertProductSchema.parse(req.body);
    const created = await storage.createProduct(product);
    res.status(201).json(created);
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

  const httpServer = createServer(app);
  return httpServer;
}