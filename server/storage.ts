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
import { eq, and, sql, desc, gt, sum, count } from "drizzle-orm";
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
  async getRevenueOverTime(days: number): Promise<any[]> {
    const result = await db.execute(sql`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '1 day' * ${days}::integer,
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS date
      )
      SELECT 
        dates.date::text as date,
        COALESCE(SUM(o.total_amount), 0) as revenue
      FROM dates
      LEFT JOIN ${orders} o ON DATE(o.created_at) = dates.date
      GROUP BY dates.date
      ORDER BY dates.date
    `);
    return result.rows;
  }

  async getOrderStatusBreakdown(): Promise<any> {
    const result = await db.execute(sql`
      SELECT 
        status as name,
        COUNT(*)::integer as value
      FROM ${orders}
      GROUP BY status
    `);
    return result.rows;
  }

  async getAnalyticsSummary(): Promise<any> {
    try {
      const [productCount] = await db
        .select({ count: count(products.id) })
        .from(products);

      const [orderCount] = await db
        .select({ count: count(orders.id) })
        .from(orders);

      // Use COALESCE to handle NULL values when no orders exist
      const result = await db.execute(sql`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM ${orders}
      `);
      const totalRevenue = parseFloat(result.rows[0]?.total_revenue || "0");

      const averageOrderValue = orderCount.count > 0
        ? totalRevenue / orderCount.count
        : 0;

      // Use COALESCE for inventory value calculation too
      const inventoryResult = await db.execute(sql`
        SELECT COALESCE(SUM(price::numeric * "stockQuantity"), 0) as total_inventory_value
        FROM ${products}
      `);
      const inventoryValue = parseFloat(inventoryResult.rows[0]?.total_inventory_value || "0");

      return {
        totalProducts: productCount.count,
        totalOrders: orderCount.count,
        totalRevenue: totalRevenue,
        averageOrderValue,
        inventoryValue: inventoryValue
      };
    } catch (error) {
      console.error("Error getting analytics summary:", error);
      // Return default values if there's an error
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        inventoryValue: 0
      };
    }
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

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    // If stock quantity is 0 or less, automatically set isAvailable to false
    if (data.stockQuantity !== undefined && data.stockQuantity <= 0 && data.isAvailable === undefined) {
      data.isAvailable = false;
    }

    const [updated] = await db
      .update(products)
      .set(data)
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

  // Added OTP functions (incomplete due to missing schema)
  async createOTP(userId: number, purpose: string, expiresInMinutes: number = 15) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    // Requires schema.otpCodes table definition
    // await db.insert(schema.otpCodes).values({  //schema.otpCodes is undefined here.
    //   userId,
    //   code,
    //   purpose,
    //   expiresAt,
    //   used: false,
    // });

    return code;
  }

  async verifyOTP(userId: number, code: string, purpose: string) {
    const now = new Date();

    // Requires schema.otpCodes table definition
    // const results = await db
    //   .select()
    //   .from(schema.otpCodes) //schema.otpCodes is undefined here.
    //   .where(and(
    //     eq(schema.otpCodes.userId, userId),
    //     eq(schema.otpCodes.code, code),
    //     eq(schema.otpCodes.purpose, purpose),
    //     eq(schema.otpCodes.used, false),
    //     gt(schema.otpCodes.expiresAt, now)
    //   ));

    // if (results.length === 0) {
    //   return false;
    // }

    // // Requires schema.otpCodes table definition
    // await db
    //   .update(schema.otpCodes) //schema.otpCodes is undefined here.
    //   .set({ used: true })
    //   .where(eq(schema.otpCodes.id, results[0].id));

    return true;
  }
}

export const storage = new DatabaseStorage();