// Order ID Management System
// Maintains persistent, sequential order IDs regardless of deletions

const ORDER_ID_KEY = 'themis_next_order_id';

export class OrderIdManager {
  private static instance: OrderIdManager;
  private nextOrderId: number;

  private constructor() {
    // Initialize from localStorage or start at 1
    const savedId = localStorage.getItem(ORDER_ID_KEY);
    this.nextOrderId = savedId ? parseInt(savedId, 10) : 1;
    
    // Ensure we have a valid number
    if (isNaN(this.nextOrderId) || this.nextOrderId < 1) {
      this.nextOrderId = 1;
    }
    
    console.log(`OrderIdManager initialized with next ID: ${this.nextOrderId}`);
  }

  public static getInstance(): OrderIdManager {
    if (!OrderIdManager.instance) {
      OrderIdManager.instance = new OrderIdManager();
    }
    return OrderIdManager.instance;
  }

  /**
   * Get the next available order ID and increment the counter
   */
  public getNextOrderId(): number {
    const currentId = this.nextOrderId;
    this.nextOrderId++;
    this.saveToStorage();
    
    console.log(`Generated order ID: ${currentId}, next will be: ${this.nextOrderId}`);
    return currentId;
  }

  /**
   * Get the current next ID without incrementing (for preview purposes)
   */
  public peekNextOrderId(): number {
    return this.nextOrderId;
  }

  /**
   * Reset the ID counter (for development/testing purposes)
   */
  public resetCounter(startId: number = 1): void {
    this.nextOrderId = startId;
    this.saveToStorage();
    console.log(`Order ID counter reset to: ${this.nextOrderId}`);
  }

  /**
   * Set the next ID to a specific value (useful for syncing with existing data)
   */
  public setNextOrderId(nextId: number): void {
    if (nextId > 0) {
      this.nextOrderId = nextId;
      this.saveToStorage();
      console.log(`Order ID counter set to: ${this.nextOrderId}`);
    }
  }

  /**
   * Initialize the counter based on existing orders
   */
  public initializeFromExistingOrders(existingOrderIds: number[]): void {
    if (existingOrderIds.length === 0) {
      this.nextOrderId = 1;
    } else {
      // Find the highest existing ID and set next to be one higher
      const maxId = Math.max(...existingOrderIds);
      this.nextOrderId = maxId + 1;
    }
    this.saveToStorage();
    console.log(`Order ID counter initialized from existing orders: ${this.nextOrderId}`);
  }

  /**
   * Save the current state to localStorage
   */
  private saveToStorage(): void {
    localStorage.setItem(ORDER_ID_KEY, this.nextOrderId.toString());
  }

  /**
   * Get statistics about the ID system
   */
  public getStats(): { nextId: number; totalGenerated: number } {
    return {
      nextId: this.nextOrderId,
      totalGenerated: this.nextOrderId - 1
    };
  }
}

// Export singleton instance
export const orderIdManager = OrderIdManager.getInstance();