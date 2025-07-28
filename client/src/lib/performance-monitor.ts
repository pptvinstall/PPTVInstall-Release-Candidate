// Performance monitoring and optimization utilities
import { debounce } from './optimized-utils';

// Performance metrics collection
interface PerformanceMetrics {
  route: string;
  loadTime: number | null;
  renderTime: number | null;
  memoryUsage: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private routeTimers: Map<string, number> = new Map();
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initPerformanceObserver();
    this.startMemoryMonitoring();
  }

  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          }
        }
      });
      
      this.observer.observe({ entryTypes: ['navigation'] });
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    try {
      const metrics: PerformanceMetrics = {
        route: window.location.pathname,
        loadTime: Math.max(0, entry.loadEventEnd - entry.fetchStart) || null,
        renderTime: Math.max(0, entry.domContentLoadedEventEnd - entry.fetchStart) || null,
        memoryUsage: this.getMemoryUsage(),
        timestamp: Date.now()
      };

      this.metrics.push(metrics);
      
      // Keep only last 30 metrics to prevent memory leaks (reduced from 50)
      if (this.metrics.length > 30) {
        this.metrics = this.metrics.slice(-30);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance:', metrics);
      }
    } catch (error) {
      // Handle navigation metrics errors gracefully - suppress in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Navigation metrics error:', error);
      }
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private startMemoryMonitoring = debounce(() => {
    try {
      const memUsage = this.getMemoryUsage();
      if (memUsage > 100) { // Alert if memory usage > 100MB
        console.warn('🚨 High memory usage detected:', memUsage.toFixed(2), 'MB');
        // Trigger garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      }
    } catch (error) {
      // Silently handle memory monitoring errors to prevent script errors
      console.debug('Memory monitoring error:', error);
    }
  }, 10000);

  // Public methods
  startRouteTimer(route: string) {
    this.routeTimers.set(route, performance.now());
  }

  endRouteTimer(route: string) {
    const startTime = this.routeTimers.get(route);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Route ${route} loaded in ${duration.toFixed(2)}ms`);
      }
      this.routeTimers.delete(route);
    }
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const validMetrics = this.metrics.filter(metric => metric.loadTime !== null);
    if (validMetrics.length === 0) return 0;
    const total = validMetrics.reduce((sum, metric) => sum + (metric.loadTime || 0), 0);
    return total / validMetrics.length;
  }

  getMetrics() {
    return [...this.metrics];
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
    this.routeTimers.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return {
    end: () => {
      const duration = performance.now() - startTime;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${componentName} rendered in ${duration.toFixed(2)}ms`);
      }
    }
  };
}

// Image lazy loading optimization
export function createOptimizedImageLoader() {
  const imageCache = new Map<string, HTMLImageElement>();
  const loadingImages = new Set<string>();

  return {
    preloadImage: (src: string): Promise<void> => {
      if (imageCache.has(src) || loadingImages.has(src)) {
        return Promise.resolve();
      }

      loadingImages.add(src);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(src, img);
          loadingImages.delete(src);
          resolve();
        };
        img.onerror = () => {
          loadingImages.delete(src);
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
      });
    },

    isImageCached: (src: string) => imageCache.has(src),
    
    clearCache: () => {
      imageCache.clear();
      loadingImages.clear();
    }
  };
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('📦 Bundle Analysis');
  console.log('Scripts:', scripts.length);
  console.log('Stylesheets:', styles.length);
  
  // Estimate total bundle size (rough approximation)
  let totalSize = 0;
  scripts.forEach((script: any) => {
    if (script.src.includes('chunk')) {
      totalSize += 150000; // ~150KB average chunk size
    }
  });

  console.log('Estimated bundle size:', (totalSize / 1024).toFixed(2), 'KB');
  console.groupEnd();
}

// Cleanup function for app shutdown
export function cleanupPerformanceMonitoring() {
  performanceMonitor.cleanup();
}

export default {
  performanceMonitor,
  usePerformanceMonitor,
  createOptimizedImageLoader,
  analyzeBundleSize,
  cleanupPerformanceMonitoring
};