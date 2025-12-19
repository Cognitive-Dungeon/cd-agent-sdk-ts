/**
 * MessageQueue - Очередь сообщений для WebSocket
 *
 * Управляет очередью сообщений, которые должны быть отправлены
 * при восстановлении соединения.
 */
import type { ClientToServerCommand } from "../protocol";
/**
 * Сообщение в очереди отправки
 */
export interface QueuedMessage {
    /** Команда для отправки */
    command: ClientToServerCommand;
    /** Время добавления в очередь */
    timestamp: number;
    /** Количество попыток отправки */
    attempts: number;
    /** Callback успешной отправки */
    onSuccess?: () => void;
    /** Callback ошибки отправки */
    onError?: (error: Error) => void;
}
/**
 * Конфигурация очереди сообщений
 */
export interface MessageQueueConfig {
    /** Максимальный размер очереди */
    maxSize: number;
    /** Включить логирование */
    debug?: boolean;
}
/**
 * Опции добавления сообщения в очередь
 */
export interface EnqueueOptions {
    /** Callback успешной отправки */
    onSuccess?: () => void;
    /** Callback ошибки отправки */
    onError?: (error: Error) => void;
}
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
export declare class MessageQueue {
    private queue;
    private config;
    constructor(config?: Partial<MessageQueueConfig>);
    /**
     * Добавить сообщение в очередь
     *
     * @param command - Команда для добавления
     * @param options - Опции (callbacks)
     * @returns true если добавлено, false если очередь переполнена
     */
    enqueue(command: ClientToServerCommand, options?: EnqueueOptions): boolean;
    /**
     * Извлечь все сообщения из очереди
     *
     * Очищает очередь и возвращает все сообщения для отправки.
     *
     * @returns Массив сообщений
     */
    flush(): QueuedMessage[];
    /**
     * Получить следующее сообщение без удаления
     *
     * @returns Следующее сообщение или undefined
     */
    peek(): QueuedMessage | undefined;
    /**
     * Извлечь следующее сообщение
     *
     * @returns Следующее сообщение или undefined
     */
    dequeue(): QueuedMessage | undefined;
    /**
     * Очистить очередь
     *
     * @param notifyErrors - Вызвать onError для каждого сообщения
     */
    clear(notifyErrors?: boolean): void;
    /**
     * Получить текущий размер очереди
     */
    get size(): number;
    /**
     * Проверить, пуста ли очередь
     */
    get isEmpty(): boolean;
    /**
     * Проверить, заполнена ли очередь
     */
    get isFull(): boolean;
    /**
     * Получить максимальный размер очереди
     */
    get maxSize(): number;
    /**
     * Логирование
     */
    private log;
}
//# sourceMappingURL=MessageQueue.d.ts.map