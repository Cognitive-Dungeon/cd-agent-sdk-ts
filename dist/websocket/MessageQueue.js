/**
 * MessageQueue - Очередь сообщений для WebSocket
 *
 * Управляет очередью сообщений, которые должны быть отправлены
 * при восстановлении соединения.
 */
// ============================================================================
// MessageQueue Class
// ============================================================================
/**
 * Очередь сообщений для WebSocket
 *
 * Используется для буферизации сообщений, когда соединение недоступно.
 * При восстановлении соединения сообщения отправляются в порядке FIFO.
 *
 * @example
 * ```typescript
 * const queue = new MessageQueue({ maxSize: 100 });
 *
 * // Добавить сообщение
 * queue.enqueue({ action: "MOVE", payload: { dx: 1, dy: 0 } });
 *
 * // Получить и отправить все сообщения
 * const messages = queue.flush();
 * messages.forEach(msg => ws.send(JSON.stringify(msg.command)));
 * ```
 */
export class MessageQueue {
    queue = [];
    config;
    constructor(config = {}) {
        this.config = {
            maxSize: config.maxSize ?? 100,
            debug: config.debug ?? false,
        };
    }
    /**
     * Добавить сообщение в очередь
     *
     * @param command - Команда для добавления
     * @param options - Опции (callbacks)
     * @returns true если добавлено, false если очередь переполнена
     */
    enqueue(command, options = {}) {
        // Если очередь переполнена, удаляем самое старое сообщение
        if (this.queue.length >= this.config.maxSize) {
            const dropped = this.queue.shift();
            if (dropped?.onError) {
                dropped.onError(new Error("Message dropped: queue overflow"));
            }
            this.log(`Queue overflow, dropped oldest message`);
        }
        const message = {
            command,
            timestamp: Date.now(),
            attempts: 0,
            onSuccess: options.onSuccess,
            onError: options.onError,
        };
        this.queue.push(message);
        this.log(`Message queued, queue size: ${this.queue.length}`);
        return true;
    }
    /**
     * Извлечь все сообщения из очереди
     *
     * Очищает очередь и возвращает все сообщения для отправки.
     *
     * @returns Массив сообщений
     */
    flush() {
        const messages = [...this.queue];
        this.queue = [];
        this.log(`Flushed ${messages.length} messages`);
        return messages;
    }
    /**
     * Получить следующее сообщение без удаления
     *
     * @returns Следующее сообщение или undefined
     */
    peek() {
        return this.queue[0];
    }
    /**
     * Извлечь следующее сообщение
     *
     * @returns Следующее сообщение или undefined
     */
    dequeue() {
        return this.queue.shift();
    }
    /**
     * Очистить очередь
     *
     * @param notifyErrors - Вызвать onError для каждого сообщения
     */
    clear(notifyErrors = false) {
        if (notifyErrors) {
            const error = new Error("Queue cleared");
            this.queue.forEach((msg) => {
                if (msg.onError) {
                    msg.onError(error);
                }
            });
        }
        this.queue = [];
        this.log("Queue cleared");
    }
    /**
     * Получить текущий размер очереди
     */
    get size() {
        return this.queue.length;
    }
    /**
     * Проверить, пуста ли очередь
     */
    get isEmpty() {
        return this.queue.length === 0;
    }
    /**
     * Проверить, заполнена ли очередь
     */
    get isFull() {
        return this.queue.length >= this.config.maxSize;
    }
    /**
     * Получить максимальный размер очереди
     */
    get maxSize() {
        return this.config.maxSize;
    }
    /**
     * Логирование
     */
    log(message) {
        if (this.config.debug) {
            // eslint-disable-next-line no-console
            console.log(`[MessageQueue] ${message}`);
        }
    }
}
//# sourceMappingURL=MessageQueue.js.map