// Browser compatibility utilities and polyfills

export class BrowserSupport {
  static isSupported(): boolean {
    return this.checkModernFeatures();
  }

  static checkModernFeatures(): boolean {
    const features = [
      "fetch" in window,
      "Promise" in window,
      "Map" in window,
      "Set" in window,
      "localStorage" in window,
      "sessionStorage" in window,
      "EventSource" in window,
      "IntersectionObserver" in window,
      "ResizeObserver" in window,
      "performance" in window,
      "requestAnimationFrame" in window,
      "cancelAnimationFrame" in window,
    ];

    return features.every((feature) => feature);
  }

  static getBrowserInfo(): {
    name: string;
    version: string;
    isMobile: boolean;
    isSupported: boolean;
  } {
    const ua = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // Detect browser
    let name = "Unknown";
    let version = "Unknown";

    if (ua.includes("Chrome") && !ua.includes("Edg")) {
      name = "Chrome";
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : "Unknown";
    } else if (ua.includes("Firefox")) {
      name = "Firefox";
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : "Unknown";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      name = "Safari";
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : "Unknown";
    } else if (ua.includes("Edg")) {
      name = "Edge";
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : "Unknown";
    } else if (ua.includes("Opera") || ua.includes("OPR")) {
      name = "Opera";
      const match = ua.match(/(?:Opera|OPR)\/(\d+)/);
      version = match ? match[1] : "Unknown";
    }

    return {
      name,
      version,
      isMobile,
      isSupported: this.isSupported(),
    };
  }

  static showCompatibilityWarning(): void {
    const browser = this.getBrowserInfo();

    if (!browser.isSupported) {
      const warning = document.createElement("div");
      warning.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #f59e0b;
          color: white;
          padding: 1rem;
          text-align: center;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <strong>⚠️ Navegador no compatible</strong><br>
          Para una mejor experiencia, actualiza tu navegador o usa Chrome, Firefox, Safari o Edge modernos.
          <button onclick="this.parentElement.remove()" style="
            margin-left: 1rem;
            background: rgba(255,255,255,0.2);
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            cursor: pointer;
          ">Cerrar</button>
        </div>
      `;
      document.body.appendChild(warning);
    }
  }
}

// Polyfills for unsupported features
export function applyPolyfills(): void {
  // Polyfill for Element.closest (IE 11)
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (selector: string) {
      let element = this as Element;
      while (element && element.nodeType === 1) {
        if (element.matches(selector)) {
          return element;
        }
        element = element.parentElement!;
      }
      return null;
    };
  }

  // Polyfill for Element.matches (IE 11)
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      (Element.prototype as any).msMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (this: Element, selector: string) {
        const elements = document.querySelectorAll(selector);
        let index = 0;
        while (index < elements.length) {
          if (elements[index] === this) {
            return true;
          }
          index++;
        }
        return false;
      };
  }

  // Polyfill for Array.includes (IE 11)
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (
      searchElement: any,
      fromIndex?: number,
    ) {
      const array = Object(this);
      const len = array.length >>> 0;
      const start = fromIndex || 0;
      let k = Math.max(start >= 0 ? start : len + start, 0);

      while (k < len) {
        if (array[k] === searchElement) {
          return true;
        }
        k++;
      }
      return false;
    };
  }

  // Polyfill for Object.assign (IE 11)
  if (typeof Object.assign !== "function") {
    Object.assign = function (target: any, ...sources: any[]) {
      if (target === null || target === undefined) {
        throw new TypeError("Cannot convert undefined or null to object");
      }

      const to = Object(target);

      for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
        if (source !== null && source !== undefined) {
          for (const key in source) {
            if (source.hasOwnProperty(key)) {
              to[key] = source[key];
            }
          }
        }
      }
      return to;
    };
  }

  // Polyfill for Promise (very basic, for older browsers)
  if (typeof Promise === "undefined") {
    // This is a very basic Promise polyfill
    // In production, you might want to use a more complete one
    console.warn(
      "Promise is not supported. Some features may not work correctly.",
    );
  }
}

// Feature detection and graceful degradation
export class FeatureDetector {
  static hasWebGL(): boolean {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && canvas.getContext("webgl"));
    } catch (e) {
      return false;
    }
  }

  static hasWebRTC(): boolean {
    return !!(
      navigator.mediaDevices &&
      "getUserMedia" in navigator.mediaDevices &&
      window.RTCPeerConnection
    );
  }

  static hasServiceWorkers(): boolean {
    return "serviceWorker" in navigator;
  }

  static hasIndexedDB(): boolean {
    return !!(
      window.indexedDB ||
      (window as any).mozIndexedDB ||
      (window as any).webkitIndexedDB ||
      (window as any).msIndexedDB
    );
  }

  static hasWebSockets(): boolean {
    return "WebSocket" in window && window.WebSocket.CLOSING === 2;
  }

  static hasIntersectionObserver(): boolean {
    return "IntersectionObserver" in window;
  }

  static hasResizeObserver(): boolean {
    return "ResizeObserver" in window;
  }

  static hasPerformanceObserver(): boolean {
    return "PerformanceObserver" in window;
  }

  static getSupportedFeatures(): Record<string, boolean> {
    return {
      webgl: this.hasWebGL(),
      webrtc: this.hasWebRTC(),
      serviceWorkers: this.hasServiceWorkers(),
      indexedDB: this.hasIndexedDB(),
      webSockets: this.hasWebSockets(),
      intersectionObserver: this.hasIntersectionObserver(),
      resizeObserver: this.hasResizeObserver(),
      performanceObserver: this.hasPerformanceObserver(),
    };
  }
}

// Performance optimizations based on browser capabilities
export class BrowserOptimizer {
  static optimizeForBrowser(): void {
    const features = FeatureDetector.getSupportedFeatures();

    // Disable heavy animations on low-performance devices/browsers
    if (!features.webgl || !features.performanceObserver) {
      document.documentElement.classList.add("reduced-motion");
    }

    // Use IntersectionObserver for lazy loading if available
    if (!features.intersectionObserver) {
      console.warn(
        "IntersectionObserver not supported. Some lazy loading features may not work.",
      );
    }

    // Fallback for older browsers without Service Workers
    if (!features.serviceWorkers) {
      console.info(
        "Service Workers not supported. Offline features will not be available.",
      );
    }
  }

  static detectSlowDevice(): boolean {
    // Simple heuristic for slow devices
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      return (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.saveData === true
      );
    }

    // Fallback: check hardware concurrency
    return !!(
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
    );
  }

  static applyPerformanceOptimizations(): void {
    const isSlowDevice = this.detectSlowDevice();

    if (isSlowDevice) {
      // Reduce animation complexity
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.2s",
      );

      // Disable non-essential features
      console.info(
        "Slow device detected. Some animations and effects have been disabled for better performance.",
      );
    }
  }
}

// Cross-browser event handling
export class CrossBrowserEvents {
  static addEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    if (element.addEventListener) {
      element.addEventListener(event, handler, options);
    } else {
      // IE 8 fallback
      (element as any).attachEvent(`on${event}`, handler);
    }
  }

  static removeEventListener(
    element: Element | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | EventListenerOptions,
  ): void {
    if (element.removeEventListener) {
      element.removeEventListener(event, handler, options);
    } else {
      // IE 8 fallback
      (element as any).detachEvent(`on${event}`, handler);
    }
  }
}

// Initialize browser compatibility on load
if (typeof window !== "undefined") {
  // Apply polyfills
  applyPolyfills();

  // Check browser support
  if (!BrowserSupport.isSupported()) {
    BrowserSupport.showCompatibilityWarning();
  }

  // Apply optimizations
  BrowserOptimizer.optimizeForBrowser();
  BrowserOptimizer.applyPerformanceOptimizations();
}
