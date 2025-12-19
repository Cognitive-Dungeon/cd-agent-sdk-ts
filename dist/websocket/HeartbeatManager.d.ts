/**
 * HeartbeatManager - Управление heartbeat пингами WebSocket
 *
 * Отвечает за:
 * - Периодическую отправку PING сообщений
 * - Отслеживание PONG ответов
 * - Определение "мертвых" соединений по таймауту
 */
/**
 * Конфигурация heartbeat
 */
export interface HeartbeatConfig {
    /** Интервал отправки heartbeat (мс). 0 = отключено */
    interval: number;
    /** Таймаут ожидания ответа (мс) */
    timeout: number;
    /** Включить логирование */
    debug?: boolean;
}
/**
 * Callback для отправки ping сообщения
 */
export type SendPingFn = () => boolean;
/**
 * Callback при таймауте heartbeat (соединение "мертво")
 */
export type OnTimeoutFn = () => void;
/**
 * Callback при получении pong (с latency)
 */
export type OnPongFn = (latency: number) => void;
/**
 * Менеджер heartbeat пингов
 *
 * Периодически отправляет PING сообщения и ожидает PONG ответы.
 * Если ответ не получен в течение таймаута, вызывается onTimeout callback.
 *
 * @example
 * ```typescript
 * const heartbeat = new HeartbeatManager({
 *   interval: 30000,  // каждые 30 секунд
 *   timeout: 10000,   // таймаут 10 секунд
 * });
 *
 * heartbeat.start(
 *   () => ws.send(JSON.stringify({ type: "PING" })),
 *   () => console.log("Connection dead!"),
 *   (latency) => console.log(`Latency: ${latency}ms`)
 * );
 *
 * // При получении PONG от сервера
 * heartbeat.handlePong();
 *
 * // При отключении
 * heartbeat.stop();
 * ```
 */
export declare class HeartbeatManager {
    private config;
    private sendPing;
    private onTimeout;
    private onPong;
    private intervalId;
    private timeoutId;
    private lastPingTime;
    private isRunning;
    constructor(config?: Partial<HeartbeatConfig>);
    /**
     * Запустить heartbeat
     *
     * @param sendPing - Функция отправки PING
     * @param onTimeout - Callback при таймауте (соединение мертво)
     * @param onPong - Callback при получении PONG (опционально)
     */
    start(sendPing: SendPingFn, onTimeout: OnTimeoutFn, onPong?: OnPongFn): void;
    /**
     * Остановить heartbeat
     */
    stop(): void;
    /**
     * Обработать получение PONG ответа
     *
     * Должен вызываться при получении PONG сообщения от сервера.
     */
    handlePong(): void;
    /**
     * Проверить, запущен ли heartbeat
     */
    get running(): boolean;
    /**
     * Проверить, включен ли heartbeat в конфигурации
     */
    get enabled(): boolean;
    /**
     * Обновить конфигурацию
     *
     * @param config - Новая конфигурация
     * @note Требуется перезапуск для применения изменений
     */
    updateConfig(config: Partial<HeartbeatConfig>): void;
    /**
     * Отправить heartbeat ping
     */
    private sendHeartbeat;
    /**
     * Обработать таймаут heartbeat
     */
    private handleHeartbeatTimeout;
    /**
     * Логирование
     */
    private log;
}
//# sourceMappingURL=HeartbeatManager.d.ts.map