/**
 * Pranayama Times — Startup Performance Instrumentation
 * Accurately measures and logs the 10 critical startup milestones
 * according to Phase 1 of the startup optimization audit.
 * 
 * Never logs sensitive user data.
 */

interface StartupMetricRecord {
  name: string;
  durationMs: number;
  timestampMs: number;
  details?: Record<string, unknown>;
}

class StartupMetricsCollector {
  private metrics: Map<string, StartupMetricRecord> = new Map();
  private marks: Map<string, number> = new Map();
  private hasReported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.mark('html_script_execution');
    }
  }

  public mark(name: string): void {
    if (typeof window === 'undefined') return;
    this.marks.set(name, performance.now());
  }

  public measure(name: string, startMark: string, details?: Record<string, unknown>): number {
    if (typeof window === 'undefined') return 0;
    const startTime = this.marks.get(startMark);
    const now = performance.now();
    const durationMs = startTime !== undefined ? Math.max(0, now - startTime) : 0;

    this.metrics.set(name, {
      name,
      durationMs: parseFloat(durationMs.toFixed(2)),
      timestampMs: parseFloat(now.toFixed(2)),
      details,
    });

    return durationMs;
  }

  public recordRaw(name: string, durationMs: number, details?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    this.metrics.set(name, {
      name,
      durationMs: parseFloat(durationMs.toFixed(2)),
      timestampMs: parseFloat(performance.now().toFixed(2)),
      details,
    });
  }

  /**
   * Compiles the 10 essential startup metrics required by Phase 1
   */
  public getReport(): Record<string, unknown> {
    if (typeof window === 'undefined') return {};

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

    const docResponse = nav ? nav.responseStart - nav.requestStart : 0;
    const jsDownloadParse = nav ? nav.domContentLoadedEventEnd - nav.responseEnd : 0;
    const domInteractive = nav ? nav.domInteractive - nav.responseEnd : 0;

    const report = {
      platform: {
        isIos: /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()),
        isStandalone:
          window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as unknown as { standalone?: boolean }).standalone === true,
        userAgent: navigator.userAgent.substring(0, 100),
      },
      timings: {
        '1_document_response_ms': parseFloat(docResponse.toFixed(2)),
        '2_javascript_download_parse_ms': parseFloat(jsDownloadParse.toFixed(2)),
        '2b_dom_interactive_ms': parseFloat(domInteractive.toFixed(2)),
        '3_hydration_ms': this.metrics.get('react_hydration')?.durationMs ?? 0,
        '4_app_mounting_ms': this.metrics.get('app_mounting')?.durationMs ?? 0,
        '5_display_mode_detection_ms': this.metrics.get('display_mode_detect')?.durationMs ?? 0,
        '6_service_worker_init_ms': this.metrics.get('sw_registration')?.durationMs ?? 0,
        '7_indexeddb_init_ms': this.metrics.get('indexeddb_open')?.durationMs ?? 0,
        '8_settings_retrieval_ms': this.metrics.get('settings_retrieval')?.durationMs ?? 0,
        '9_active_session_recovery_ms': this.metrics.get('active_session_recovery')?.durationMs ?? 0,
        '10_first_meaningful_render_ms': this.metrics.get('first_meaningful_render')?.durationMs ?? 0,
      },
      allMetrics: Object.fromEntries(this.metrics.entries()),
    };

    return report;
  }

  public logReportOnce(): void {
    if (typeof window === 'undefined' || this.hasReported) return;
    this.hasReported = true;

    // Log in development or when requested
    if (process.env.NODE_ENV === 'development' || window.location.search.includes('perf=1')) {
      const report = this.getReport();
      console.log('[StartupMetrics] 🚀 iPhone Startup Performance Report:\n', JSON.stringify(report, null, 2));
    }
  }
}

export const startupMetrics = new StartupMetricsCollector();

if (typeof window !== 'undefined') {
  (window as unknown as { __PRANAYAMA_STARTUP_METRICS__?: StartupMetricsCollector }).__PRANAYAMA_STARTUP_METRICS__ = startupMetrics;
}
