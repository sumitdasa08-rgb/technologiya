import { useState, useEffect, useCallback } from 'react';
import { logger, LogLevel, LogEntry } from '@/utils/logger';
import { X, Download, Trash2, Eye, EyeOff } from 'lucide-react';

/**
 * Debug Panel Component
 * Shows logs in real-time, filterable by level and component
 * Only visible in development mode
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [componentFilter, setComponentFilter] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Refresh logs periodically
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLogs([...logger.getLogs()].reverse());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initial load
  useEffect(() => {
    setLogs([...logger.getLogs()].reverse());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const levelMatch = filter === 'ALL' || log.level === filter;
    const componentMatch = componentFilter === 'ALL' || log.component === componentFilter;
    return levelMatch && componentMatch;
  });

  const stats = logger.getStats();
  const components = Array.from(new Set(logs.map((log) => log.component)));

  const handleDownload = useCallback(() => {
    logger.downloadLogs();
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear all logs? This cannot be undone.')) {
      logger.clearLogs();
      setLogs([]);
    }
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-colors flex items-center justify-center"
        title="Open Debug Panel"
      >
        <Eye className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-2xl h-96 bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-muted border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm">Debug Panel</h3>
          <div className="text-xs text-muted-foreground space-x-3">
            <span>📊 Total: {stats.totalLogs}</span>
            <span className="text-red-500">❌ Errors: {stats.errors}</span>
            <span className="text-yellow-500">⚠️ Warnings: {stats.warnings}</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-muted-foreground/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background border-b border-border p-2 flex gap-2 items-center flex-wrap text-xs">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as LogLevel | 'ALL')}
          className="px-2 py-1 rounded bg-muted border border-border text-xs"
        >
          <option value="ALL">All Levels</option>
          <option value={LogLevel.DEBUG}>DEBUG</option>
          <option value={LogLevel.INFO}>INFO</option>
          <option value={LogLevel.WARN}>WARN</option>
          <option value={LogLevel.ERROR}>ERROR</option>
          <option value={LogLevel.CRITICAL}>CRITICAL</option>
        </select>

        <select
          value={componentFilter}
          onChange={(e) => setComponentFilter(e.target.value)}
          className="px-2 py-1 rounded bg-muted border border-border text-xs"
        >
          <option value="ALL">All Components</option>
          {components.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Auto Refresh</span>
        </label>

        <div className="flex-1" />

        <button
          onClick={handleDownload}
          className="p-1 hover:bg-muted-foreground/20 rounded"
          title="Download logs"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={handleClear}
          className="p-1 hover:bg-red-500/20 rounded text-red-500"
          title="Clear all logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto bg-background font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-muted-foreground text-center">No logs matching filter</div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`p-2 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
                  ? 'bg-red-500/10'
                  : log.level === LogLevel.WARN
                    ? 'bg-yellow-500/10'
                    : ''
              }`}
            >
              <div className="flex gap-2 items-start">
                <span className="text-muted-foreground min-w-max">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`min-w-max font-bold ${
                    log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
                      ? 'text-red-500'
                      : log.level === LogLevel.WARN
                        ? 'text-yellow-500'
                        : log.level === LogLevel.DEBUG
                          ? 'text-gray-500'
                          : ''
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-primary min-w-max">[{log.component}]</span>
                <span className="flex-1">{log.message}</span>
              </div>
              {log.data && (
                <details className="ml-20 mt-1">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Data
                  </summary>
                  <pre className="text-xs bg-muted p-2 mt-1 rounded max-h-32 overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </details>
              )}
              {log.stack && (
                <details className="ml-20 mt-1">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Stack Trace
                  </summary>
                  <pre className="text-xs bg-red-500/10 p-2 mt-1 rounded max-h-32 overflow-auto">
                    {log.stack}
                  </pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-muted border-t border-border p-2 text-xs text-muted-foreground flex justify-between">
        <span>Showing {filteredLogs.length} of {stats.totalLogs} logs</span>
        <span className="cursor-pointer hover:text-foreground" onClick={() => logger.printSummary()}>
          Print Stats →
        </span>
      </div>
    </div>
  );
}

export default DebugPanel;
