import { type IStorage } from "./types";
import {
  User,
  Product,
  Order,
  OrderItem,
  CartItem,
  InsertUser,
  InsertProduct,
  InsertOrder,
  InsertOrderItem,
  InsertCartItem,
  users,
  products,
  orders,
  orderItems,
  cartItems,
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Analytics methods
  async getRevenueOverTime(days: number) {
    const result = await db.execute(sql`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days} days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS date
      )
      SELECT 
        dates.date::text as name,
        COALESCE(SUM(o.total_amount), 0) as value
      FROM dates
      LEFT JOIN orders o ON DATE(o.created_at) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
    `);
    return result.rows;
  }

  async getOrderStatusBreakdown() {
    const result = await db.execute(sql`
      SELECT 
        status as name,
        COUNT(*) as value
      FROM orders
      GROUP BY status
    `);
    return result.rows;
  }

  async getAnalyticsSummary() {
    const [productCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products);

    const [orderCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders);

    const [revenue] = await db
      .select({ sum: sql<number>`COALESCE(SUM(total_amount), 0)` })
      .from(orders);

    const averageOrderValue = orderCount.count > 0 
      ? revenue.sum / orderCount.count 
      : 0;

    return {
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      totalRevenue: revenue.sum,
      averageOrderValue,
    };
  }

  // Existing methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const [newUser] = await db.insert(users).values({
      ...user,
      isAdmin: user.isAdmin || false,
    }).returning();
    return newUser;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new Error("Product not found");
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return updated;
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
}

export const storage = new DatabaseStorage();