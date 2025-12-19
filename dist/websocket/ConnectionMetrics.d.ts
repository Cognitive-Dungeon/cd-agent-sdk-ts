/**
 * ConnectionMetrics - Метрики WebSocket соединения
 *
 * Собирает и хранит статистику работы WebSocket соединения:
 * - Время подключения/отключения
 * - Количество отправленных/полученных сообщений
 * - Статистика переподключений
 * - Latency (задержка)
 */
/**
 * Метрики WebSocket соединения
 */
export interface WebSocketMetrics {
    /** Время установки текущего соединения */
    connectedAt: number | null;
    /** Время последнего отключения */
    disconnectedAt: number | null;
    /** Общее количество отправленных сообщений */
    messagesSent: number;
    /** Общее количество полученных сообщений */
    messagesReceived: number;
    /** Количество попыток переподключения */
    reconnectAttempts: number;
    /** Количество успешных переподключений */
    reconnectSuccesses: number;
    /** Количество ошибок */
    errors: number;
    /** Текущая задержка переподключения (мс) */
    currentReconnectDelay: number;
    /** Размер очереди отправки */
    queueSize: number;
    /** Среднее время roundtrip (мс) */
    averageLatency: number;
    /** Последнее время roundtrip (мс) */
    lastLatency: number;
}
/**
 * Конфигурация метрик
 */
export interface ConnectionMetricsConfig {
    /** Максимальное количество измерений latency для усреднения */
    maxLatencyMeasurements?: number;
    /** Включить логирование */
    debug?: boolean;
}
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
export declare class ConnectionMetrics {
    private config;
    private connectedAt;
    private disconnectedAt;
    private messagesSent;
    private messagesReceived;
    private reconnectAttempts;
    private reconnectSuccesses;
    private errors;
    private latencyMeasurements;
    private lastLatency;
    private currentReconnectDelay;
    private queueSize;
    constructor(config?: ConnectionMetricsConfig);
    /**
     * Записать событие подключения
     */
    recordConnect(): void;
    /**
     * Записать событие отключения
     */
    recordDisconnect(): void;
    /**
     * Записать отправленное сообщение
     */
    recordMessageSent(): void;
    /**
     * Записать полученное сообщение
     */
    recordMessageReceived(): void;
    /**
     * Записать попытку переподключения
     */
    recordReconnectAttempt(): void;
    /**
     * Записать успешное переподключение
     */
    recordReconnectSuccess(): void;
    /**
     * Записать ошибку
     */
    recordError(): void;
    /**
     * Записать измерение latency
     *
     * @param latency - Время roundtrip в миллисекундах
     */
    recordLatency(latency: number): void;
    /**
     * Установить текущую задержку переподключения
     *
     * @param delay - Задержка в миллисекундах
     */
    setReconnectDelay(delay: number): void;
    /**
     * Установить размер очереди сообщений
     *
     * @param size - Размер очереди
     */
    setQueueSize(size: number): void;
    /**
     * Получить среднюю latency
     */
    get averageLatency(): number;
    /**
     * Получить все метрики
     */
    getMetrics(): Readonly<WebSocketMetrics>;
    /**
     * Получить время с момента подключения (мс)
     */
    getConnectionDuration(): number | null;
    /**
     * Сбросить все метрики
     */
    reset(): void;
    /**
     * Сбросить только счетчики переподключений
     */
    resetReconnectCounters(): void;
    /**
     * Логирование
     */
    private log;
}
//# sourceMappingURL=ConnectionMetrics.d.ts.map