import { describe, it, expect } from "vitest";

describe("Basic Tests", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle basic string operations", () => {
    const str = "hello";
    expect(str.length).toBe(5);
    expect(str.toUpperCase()).toBe("HELLO");
  });

  it("should handle basic array operations", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
    expect(arr.includes(2)).toBe(true);
  });

  it("should handle basic object operations", () => {
    const obj = { name: "test", value: 42 };
    expect(obj.name).toBe("test");
    expect(obj.value).toBe(42);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("async result");
    expect(result).toBe("async result");
  });
});
