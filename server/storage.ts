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
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  sessionStore: session.Store;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.currentId = {
      users: 1,
      products: 1,
      orders: 1,
      orderItems: 1,
      cartItems: 1,
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin_password",
      isAdmin: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser & { isAdmin?: boolean }): Promise<User> {
    const id = this.currentId.users++;
    const newUser: User = { ...user, id, isAdmin: user.isAdmin || false };
    this.users.set(id, newUser);
    return newUser;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder: Order = { ...order, id };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const id = this.currentId.cartItems++;
    const newItem: CartItem = { ...item, id };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const item = Array.from(this.cartItems.values()).find(
      (i) => i.userId === userId && i.productId === productId,
    );
    if (!item) return undefined;
    
    const updated = { ...item, quantity };
    this.cartItems.set(item.id, updated);
    return updated;
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    const item = Array.from(this.cartItems.values()).find(
      (i) => i.userId === userId && i.productId === productId,
    );
    if (item) {
      this.cartItems.delete(item.id);
    }
  }

  async clearCart(userId: number): Promise<void> {
    const userItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    userItems.forEach((item) => this.cartItems.delete(item.id));
  }
}

export const storage = new MemStorage();
