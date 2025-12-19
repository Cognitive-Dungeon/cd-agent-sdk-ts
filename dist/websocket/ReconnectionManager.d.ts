/**
 * ReconnectionManager - Управление переподключением WebSocket
 *
 * Отвечает за:
 * - Автоматическое переподключение при разрыве соединения
 * - Экспоненциальную задержку между попытками
 * - Ограничение максимального количества попыток
 */
/**
 * Конфигурация переподключения
 */
export interface ReconnectionConfig {
    /** Максимальное количество попыток переподключения */
    maxAttempts: number;
    /** Начальная задержка перед первой попыткой (мс) */
    initialDelay: number;
    /** Максимальная задержка между попытками (мс) */
    maxDelay: number;
    /** Множитель для экспоненциального увеличения задержки */
    delayMultiplier: number;
    /** Включить логирование */
    debug?: boolean;
}
/**
 * Callback для выполнения попытки переподключения
 */
export type ReconnectFn = () => void;
/**
 * Callback при начале попытки переподключения
 */
export type OnAttemptFn = (attempt: number, maxAttempts: number, delay: number) => void;
/**
 * Callback при исчерпании попыток
 */
export type OnMaxAttemptsReachedFn = () => void;
/**
 * Состояние переподключения
 */
export interface ReconnectionState {
    /** Текущее количество попыток */
    attempts: number;
    /** Максимальное количество попыток */
    maxAttempts: number;
    /** Текущая задержка (мс) */
    currentDelay: number;
    /** Запланировано ли переподключение */
    isScheduled: boolean;
}
/**
 * Менеджер переподключения WebSocket
 *
 * Реализует экспоненциальную задержку (exponential backoff) для переподключения.
 * Каждая следующая попытка выполняется с увеличенной задержкой.
 *
 * @example
 * ```typescript
 * const reconnection = new ReconnectionManager({
 *   maxAttempts: 10,
 *   initialDelay: 1000,
 *   maxDelay: 30000,
 *   delayMultiplier: 1.5,
 * });
 *
 * reconnection.schedule(
 *   () => ws.connect(),
 *   (attempt, max, delay) => console.log(`Attempt ${attempt}/${max} in ${delay}ms`),
 *   () => console.log("Max attempts reached!")
 * );
 *
 * // При успешном подключении
 * reconnection.reset();
 *
 * // При отмене
 * reconnection.cancel();
 * ```
 */
export declare class ReconnectionManager {
    private config;
    private attempts;
    private currentDelay;
    private timeoutId;
    private isScheduled;
    private reconnectFn;
    private onAttempt;
    private onMaxAttemptsReached;
    constructor(config?: Partial<ReconnectionConfig>);
    /**
     * Запланировать попытку переподключения
     *
     * @param reconnect - Функция переподключения
     * @param onAttempt - Callback при начале попытки
     * @param onMaxAttemptsReached - Callback при исчерпании попыток
     */
    schedule(reconnect: ReconnectFn, onAttempt?: OnAttemptFn, onMaxAttemptsReached?: OnMaxAttemptsReachedFn): void;
    /**
     * Отменить запланированное переподключение
     */
    cancel(): void;
    /**
     * Сбросить состояние (после успешного подключения)
     */
    reset(): void;
    /**
     * Получить текущее состояние
     */
    getState(): ReconnectionState;
    /**
     * Проверить, исчерпаны ли попытки
     */
    get isMaxAttemptsReached(): boolean;
    /**
     * Проверить, запланировано ли переподключение
     */
    get scheduled(): boolean;
    /**
     * Получить текущее количество попыток
     */
    get attemptCount(): number;
    /**
     * Получить текущую задержку
     */
    get delay(): number;
    /**
     * Обновить конфигурацию
     *
     * @param config - Новая конфигурация
     */
    updateConfig(config: Partial<ReconnectionConfig>): void;
    /**
     * Выполнить попытку переподключения
     */
    private executeReconnect;
    /**
     * Логирование
     */
    private log;
}
//# sourceMappingURL=ReconnectionManager.d.ts.map