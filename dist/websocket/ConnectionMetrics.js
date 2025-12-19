/**
 * ConnectionMetrics - Метрики WebSocket соединения
 *
 * Собирает и хранит статистику работы WebSocket соединения:
 * - Время подключения/отключения
 * - Количество отправленных/полученных сообщений
 * - Статистика переподключений
 * - Latency (задержка)
 */
// ============================================================================
// ConnectionMetrics Class
// ============================================================================
/**
 * Сборщик метрик WebSocket соединения
 *
 * @example
 * ```typescript
 * const metrics = new ConnectionMetrics();
 *
 * // При подключении
 * metrics.recordConnect();
 *
 * // При отправке сообщения
 * metrics.recordMessageSent();
 *
 * // Получить текущие метрики
 * const stats = metrics.getMetrics();
 * console.log(`Отправлено: ${stats.messagesSent}`);
 * ```
 */
export class ConnectionMetrics {
    config;
    // Connection timestamps
    connectedAt = null;
    disconnectedAt = null;
    // Message counters
    messagesSent = 0;
    messagesReceived = 0;
    // Reconnection stats
    reconnectAttempts = 0;
    reconnectSuccesses = 0;
    // Error counter
    errors = 0;
    // Latency tracking
    latencyMeasurements = [];
    lastLatency = 0;
    // External state (set by WebSocketService)
    currentReconnectDelay = 0;
    queueSize = 0;
    constructor(config = {}) {
        this.config = {
            maxLatencyMeasurements: config.maxLatencyMeasurements ?? 10,
            debug: config.debug ?? false,
        };
    }
    // ============================================================================
    // Recording Methods
    // ============================================================================
    /**
     * Записать событие подключения
     */
    recordConnect() {
        this.connectedAt = Date.now();
        this.log("Connection recorded");
    }
    /**
     * Записать событие отключения
     */
    recordDisconnect() {
        this.disconnectedAt = Date.now();
        this.log("Disconnection recorded");
    }
    /**
     * Записать отправленное сообщение
     */
    recordMessageSent() {
        this.messagesSent++;
    }
    /**
     * Записать полученное сообщение
     */
    recordMessageReceived() {
        this.messagesReceived++;
    }
    /**
     * Записать попытку переподключения
     */
    recordReconnectAttempt() {
        this.reconnectAttempts++;
        this.log(`Reconnect attempt #${this.reconnectAttempts}`);
    }
    /**
     * Записать успешное переподключение
     */
    recordReconnectSuccess() {
        this.reconnectSuccesses++;
        this.log(`Reconnect success (total: ${this.reconnectSuccesses})`);
    }
    /**
     * Записать ошибку
     */
    recordError() {
        this.errors++;
    }
    /**
     * Записать измерение latency
     *
     * @param latency - Время roundtrip в миллисекундах
     */
    recordLatency(latency) {
        this.lastLatency = latency;
        this.latencyMeasurements.push(latency);
        // Ограничиваем количество измерений
        if (this.latencyMeasurements.length > this.config.maxLatencyMeasurements) {
            this.latencyMeasurements.shift();
        }
        this.log(`Latency recorded: ${latency}ms`);
    }
    /**
     * Установить текущую задержку переподключения
     *
     * @param delay - Задержка в миллисекундах
     */
    setReconnectDelay(delay) {
        this.currentReconnectDelay = delay;
    }
    /**
     * Установить размер очереди сообщений
     *
     * @param size - Размер очереди
     */
    setQueueSize(size) {
        this.queueSize = size;
    }
    // ============================================================================
    // Getters
    // ============================================================================
    /**
     * Получить среднюю latency
     */
    get averageLatency() {
        if (this.latencyMeasurements.length === 0) {
            return 0;
        }
        const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.latencyMeasurements.length);
    }
    /**
     * Получить все метрики
     */
    getMetrics() {
        return {
            connectedAt: this.connectedAt,
            disconnectedAt: this.disconnectedAt,
            messagesSent: this.messagesSent,
            messagesReceived: this.messagesReceived,
            reconnectAttempts: this.reconnectAttempts,
            reconnectSuccesses: this.reconnectSuccesses,
            errors: this.errors,
            currentReconnectDelay: this.currentReconnectDelay,
            queueSize: this.queueSize,
            averageLatency: this.averageLatency,
            lastLatency: this.lastLatency,
        };
    }
    /**
     * Получить время с момента подключения (мс)
     */
    getConnectionDuration() {
        if (!this.connectedAt) {
            return null;
        }
        const endTime = this.disconnectedAt ?? Date.now();
        return endTime - this.connectedAt;
    }
    // ============================================================================
    // Reset
    // ============================================================================
    /**
     * Сбросить все метрики
     */
    reset() {
        this.connectedAt = null;
        this.disconnectedAt = null;
        this.messagesSent = 0;
        this.messagesReceived = 0;
        this.reconnectAttempts = 0;
        this.reconnectSuccesses = 0;
        this.errors = 0;
        this.latencyMeasurements = [];
        this.lastLatency = 0;
        this.currentReconnectDelay = 0;
        this.queueSize = 0;
        this.log("Metrics reset");
    }
    /**
     * Сбросить только счетчики переподключений
     */
    resetReconnectCounters() {
        this.reconnectAttempts = 0;
        this.currentReconnectDelay = 0;
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    /**
     * Логирование
     */
    log(message) {
        if (this.config.debug) {
            // eslint-disable-next-line no-console
            console.log(`[ConnectionMetrics] ${message}`);
        }
    }
}
//# sourceMappingURL=ConnectionMetrics.js.map