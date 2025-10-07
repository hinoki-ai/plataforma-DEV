export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; expires: number }>();

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  static async invalidateUserPlanningDocuments(userId: string): Promise<void> {
    const instance = CacheManager.getInstance();
    const key = `planning:${userId}`;
    instance.cache.delete(key);
  }

  static async invalidateAllPlanningDocuments(): Promise<void> {
    const instance = CacheManager.getInstance();
    for (const key of instance.cache.keys()) {
      if (key.startsWith("planning:")) {
        instance.cache.delete(key);
      }
    }
  }

  static async get(key: string): Promise<any | null> {
    const instance = CacheManager.getInstance();
    const item = instance.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      instance.cache.delete(key);
      return null;
    }

    return item.data;
  }

  static async set(key: string, data: any, ttl = 300000): Promise<void> {
    const instance = CacheManager.getInstance();
    instance.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  static async delete(key: string): Promise<void> {
    const instance = CacheManager.getInstance();
    instance.cache.delete(key);
  }

  static async clear(): Promise<void> {
    const instance = CacheManager.getInstance();
    instance.cache.clear();
  }

  // Instance methods for backward compatibility
  async invalidateUserPlanningDocuments(userId: string): Promise<void> {
    return CacheManager.invalidateUserPlanningDocuments(userId);
  }

  async invalidateAllPlanningDocuments(): Promise<void> {
    return CacheManager.invalidateAllPlanningDocuments();
  }

  async get(key: string): Promise<any | null> {
    return CacheManager.get(key);
  }

  async set(key: string, data: any, ttl = 300000): Promise<void> {
    return CacheManager.set(key, data, ttl);
  }

  async delete(key: string): Promise<void> {
    return CacheManager.delete(key);
  }

  async clear(): Promise<void> {
    return CacheManager.clear();
  }
}

const cacheManager = CacheManager.getInstance();
export default cacheManager;
