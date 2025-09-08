import { PerformanceMonitor, debounce, throttle, lazyLoadImage, loadComponentDynamically } from '@/lib/performance-utils';

// Mock React for lazy loading
jest.mock('react', () => ({
  lazy: jest.fn((fn) => fn),
}));

describe('Performance Utilities', () => {
  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = PerformanceMonitor.getInstance();
      monitor.clearMetrics();
    });

    it('should be a singleton', () => {
      const monitor1 = PerformanceMonitor.getInstance();
      const monitor2 = PerformanceMonitor.getInstance();
      expect(monitor1).toBe(monitor2);
    });

    it('should measure execution time', () => {
      const mockFunction = jest.fn(() => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      const result = monitor.measureExecutionTime('test-function', mockFunction);

      expect(result).toBe(499500); // Sum of first 1000 numbers
      expect(monitor.getMetrics()['test-function_execution_time']).toBeDefined();
      expect(typeof monitor.getMetrics()['test-function_execution_time']).toBe('number');
    });

    it('should measure async execution time', async () => {
      const mockAsyncFunction = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });

      const result = await monitor.measureAsyncExecutionTime('async-test', mockAsyncFunction);

      expect(result).toBe('async result');
      expect(monitor.getMetrics()['async-test_execution_time']).toBeDefined();
      expect(monitor.getMetrics()['async-test_execution_time']).toBeGreaterThanOrEqual(10);
    });

    it('should track API calls', () => {
      const startTime = performance.now();
      monitor.measureApiCall('/api/test', startTime);

      const metrics = monitor.getMetrics();
      expect(metrics['api_/api/test_response_time']).toBeDefined();
    });

    it('should track cache hits and misses', () => {
      monitor.trackCacheHit(true);
      monitor.trackCacheHit(false);
      monitor.trackCacheHit(true);

      const metrics = monitor.getMetrics();
      expect(metrics.cache_hit_rate).toBe(66.67); // 2 hits out of 3 requests
    });

    it('should track errors', () => {
      monitor.trackError();
      monitor.trackError();
      monitor.trackError();

      const metrics = monitor.getMetrics();
      expect(metrics.error_rate).toBe(100); // 3 errors out of 3 requests (no successful requests)
    });

    it('should calculate average API response time', () => {
      // Simulate multiple API calls
      monitor.measureApiCall('/api/test1', performance.now() - 100);
      monitor.measureApiCall('/api/test2', performance.now() - 200);
      monitor.measureApiCall('/api/test3', performance.now() - 150);

      const metrics = monitor.getMetrics();
      expect(metrics.average_api_response_time).toBe(150);
    });

    it('should clear metrics', () => {
      monitor.measureExecutionTime('test', () => 'result');
      expect(Object.keys(monitor.getMetrics())).toHaveLength(1);

      monitor.clearMetrics();
      expect(Object.keys(monitor.getMetrics())).toHaveLength(0);
    });

    it('should handle memory tracking (when available)', () => {
      // Mock performance.memory
      Object.defineProperty(window.performance, 'memory', {
        value: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 5000000,
        },
        writable: true,
      });

      monitor.trackMemoryUsage();

      const metrics = monitor.getMetrics();
      expect(metrics.memory_used).toBe(1000000);
      expect(metrics.memory_total).toBe(2000000);
      expect(metrics.memory_limit).toBe(5000000);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFunction = jest.fn();
      const debouncedFunction = debounce(mockFunction, 100);

      debouncedFunction();
      debouncedFunction();
      debouncedFunction();

      expect(mockFunction).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const mockFunction = jest.fn();
      const debouncedFunction = debounce(mockFunction, 100);

      debouncedFunction('arg1', 'arg2');

      jest.advanceTimersByTime(100);

      expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFunction = jest.fn();
      const throttledFunction = throttle(mockFunction, 100);

      throttledFunction();
      throttledFunction();
      throttledFunction();

      expect(mockFunction).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttledFunction();
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('lazyLoadImage', () => {
    it('should resolve on successful image load', async () => {
      const mockImage = {
        onload: jest.fn(),
        onerror: jest.fn(),
        src: '',
      };

      // Mock Image constructor
      global.Image = jest.fn().mockImplementation(() => mockImage);

      const loadPromise = lazyLoadImage('/test-image.jpg');

      // Simulate successful load
      mockImage.onload();

      const result = await loadPromise;
      expect(result).toBe('/test-image.jpg');
      expect(mockImage.src).toBe('/test-image.jpg');
    });

    it('should reject on image load error', async () => {
      const mockImage = {
        onload: jest.fn(),
        onerror: jest.fn(),
        src: '',
      };

      global.Image = jest.fn().mockImplementation(() => mockImage);

      const loadPromise = lazyLoadImage('/test-image.jpg');

      // Simulate load error
      const testError = new Error('Image load failed');
      mockImage.onerror(testError);

      await expect(loadPromise).rejects.toThrow('Image load failed');
    });
  });

  describe('loadComponentDynamically', () => {
    it('should load component successfully', async () => {
      const mockComponent = { default: 'MockComponent' };
      const mockImportFn = jest.fn().mockResolvedValue(mockComponent);

      const result = await loadComponentDynamically(mockImportFn);

      expect(result).toBe('MockComponent');
      expect(mockImportFn).toHaveBeenCalledTimes(1);
    });

    it('should handle import errors', async () => {
      const mockImportFn = jest.fn().mockRejectedValue(new Error('Import failed'));

      await expect(loadComponentDynamically(mockImportFn)).rejects.toThrow('Import failed');
    });
  });
});