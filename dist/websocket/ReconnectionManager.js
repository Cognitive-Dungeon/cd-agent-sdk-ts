/**
 * ReconnectionManager - Управление переподключением WebSocket
 *
 * Отвечает за:
 * - Автоматическое переподключение при разрыве соединения
 * - Экспоненциальную задержку между попытками
 * - Ограничение максимального количества попыток
 */
// ============================================================================
// ReconnectionManager Class
// ============================================================================
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
export class ReconnectionManager {
    config;
    // State
    attempts = 0;
    currentDelay;
    timeoutId = null;
    isScheduled = false;
    // Callbacks
    reconnectFn = null;
    onAttempt = null;
    onMaxAttemptsReached = null;
    constructor(config = {}) {
        this.config = {
            maxAttempts: config.maxAttempts ?? 10,
            initialDelay: config.initialDelay ?? 1000,
            maxDelay: config.maxDelay ?? 30000,
            delayMultiplier: config.delayMultiplier ?? 1.5,
            debug: config.debug ?? false,
        };
        this.currentDelay = this.config.initialDelay;
    }
    // ============================================================================
    // Public Methods
    // ============================================================================
    /**
     * Запланировать попытку переподключения
     *
     * @param reconnect - Функция переподключения
     * @param onAttempt - Callback при начале попытки
     * @param onMaxAttemptsReached - Callback при исчерпании попыток
     */
    schedule(reconnect, onAttempt, onMaxAttemptsReached) {
        // Проверяем, не исчерпаны ли попытки
        if (this.attempts >= this.config.maxAttempts) {
            this.log("Max reconnect attempts reached");
            if (onMaxAttemptsReached) {
                onMaxAttemptsReached();
            }
            else if (this.onMaxAttemptsReached) {
                this.onMaxAttemptsReached();
            }
            return;
        }
        // Сохраняем callbacks
        this.reconnectFn = reconnect;
        if (onAttempt) {
            this.onAttempt = onAttempt;
        }
        if (onMaxAttemptsReached) {
            this.onMaxAttemptsReached = onMaxAttemptsReached;
        }
        // Увеличиваем счетчик попыток
        this.attempts++;
        this.isScheduled = true;
        // Вычисляем задержку
        const delay = Math.min(this.currentDelay, this.config.maxDelay);
        this.log(`Scheduling reconnect attempt ${this.attempts}/${this.config.maxAttempts} in ${delay}ms`);
        // Уведомляем о попытке
        if (this.onAttempt) {
            this.onAttempt(this.attempts, this.config.maxAttempts, delay);
        }
        // Планируем выполнение
        this.timeoutId = window.setTimeout(() => {
            this.executeReconnect();
        }, delay);
        // Увеличиваем задержку для следующей попытки
        this.currentDelay = Math.floor(this.currentDelay * this.config.delayMultiplier);
    }
    /**
     * Отменить запланированное переподключение
     */
    cancel() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.isScheduled = false;
        this.log("Reconnection cancelled");
    }
    /**
     * Сбросить состояние (после успешного подключения)
     */
    reset() {
        this.cancel();
        this.attempts = 0;
        this.currentDelay = this.config.initialDelay;
        this.reconnectFn = null;
        this.onAttempt = null;
        this.onMaxAttemptsReached = null;
        this.log("State reset");
    }
    /**
     * Получить текущее состояние
     */
    getState() {
        return {
            attempts: this.attempts,
            maxAttempts: this.config.maxAttempts,
            currentDelay: this.currentDelay,
            isScheduled: this.isScheduled,
        };
    }
    /**
     * Проверить, исчерпаны ли попытки
     */
    get isMaxAttemptsReached() {
        return this.attempts >= this.config.maxAttempts;
    }
    /**
     * Проверить, запланировано ли переподключение
     */
    get scheduled() {
        return this.isScheduled;
    }
    /**
     * Получить текущее количество попыток
     */
    get attemptCount() {
        return this.attempts;
    }
    /**
     * Получить текущую задержку
     */
    get delay() {
        return this.currentDelay;
    }
    /**
     * Обновить конфигурацию
     *
     * @param config - Новая конфигурация
     */
    updateConfig(config) {
        this.config = {
            ...this.config,
            ...config,
        };
        // Сбрасываем задержку если изменилась начальная
        if (config.initialDelay !== undefined && this.attempts === 0) {
            this.currentDelay = config.initialDelay;
        }
        this.log(`Config updated: maxAttempts=${this.config.maxAttempts}, initialDelay=${this.config.initialDelay}ms`);
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    /**
     * Выполнить попытку переподключения
     */
    executeReconnect() {
        this.timeoutId = null;
        this.isScheduled = false;
        if (this.reconnectFn) {
            this.log(`Executing reconnect attempt ${this.attempts}`);
            this.reconnectFn();
        }
    }
    /**
     * Логирование
     */
    log(message) {
        if (this.config.debug) {
            // eslint-disable-next-line no-console
            console.log(`[ReconnectionManager] ${message}`);
        }
    }
}
//# sourceMappingURL=ReconnectionManager.js.map