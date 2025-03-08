import { type User, type InsertUser } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User>;
  
  // Analytics methods
  getRevenueOverTime(days: number): Promise<{ name: string; value: number }[]>;
  getOrderStatusBreakdown(): Promise<{ name: string; value: number }[]>;
  getAnalyticsSummary(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
  
  // Other methods from the storage class...
  // (keeping only the new ones to avoid confusion)
}
