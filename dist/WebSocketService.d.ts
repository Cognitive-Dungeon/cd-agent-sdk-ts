/**
 * WebSocketService - Сервис для управления WebSocket соединением
 *
 * Рефакторенная версия с использованием модульных компонентов:
 * - MessageQueue - очередь сообщений
 * - ConnectionMetrics - сбор метрик
 * - HeartbeatManager - heartbeat пинги
 * - ReconnectionManager - переподключение
 */
import { ClientToServerCommand } from "./protocol";
import { WebSocketConfig, WebSocketState, WebSocketEvent, WebSocketEventListener, WebSocketEventDataMap, SendOptions, SendResult } from "./types";
export declare class WebSocketService {
    private config;
    private socket;
    private state;
    private isAuthenticated;
    private messageQueue;
    private metrics;
    private heartbeat;
    private reconnection;
    private connectionTimeoutId;
    private listeners;
    private isManualDisconnect;
    private isDestroyed;
    constructor(config?: WebSocketConfig);
    /**
     * Подключение к WebSocket серверу
     */
    connect(): void;
    /**
     * Отключение от WebSocket сервера
     */
    disconnect(): void;
    /**
     * Отправка команды на сервер
     */
    send(command: ClientToServerCommand, options?: SendOptions): SendResult;
    /**
     * Подписка на событие
     */
    on<E extends WebSocketEvent>(event: E, listener: WebSocketEventListener<WebSocketEventDataMap[E]>): void;
    /**
     * Отписка от события
     */
    off<E extends WebSocketEvent>(event: E, listener: WebSocketEventListener<WebSocketEventDataMap[E]>): void;
    /**
     * Однократная подписка на событие
     */
    once<E extends WebSocketEvent>(event: E, listener: WebSocketEventListener<WebSocketEventDataMap[E]>): void;
    /**
     * Установка статуса аутентификации
     */
    setAuthenticated(isAuthenticated: boolean): void;
    /**
     * Получение текущего состояния
     */
    getState(): WebSocketState;
    /**
     * Проверка подключения
     */
    isConnected(): boolean;
    /**
     * Проверка аутентификации
     */
    isAuth(): boolean;
    /**
     * Получение метрик
     */
    getMetrics(): Readonly<import("./websocket").WebSocketMetrics>;
    /**
     * Очистка очереди сообщений
     */
    clearQueue(): void;
    /**
     * Уничтожение сервиса
     */
    destroy(): void;
    /**
     * Создание WebSocket соединения
     */
    private createConnection;
    /**
     * Обработка открытия соединения
     */
    private handleOpen;
    /**
     * Обработка входящего сообщения
     */
    private handleMessage;
    /**
     * Обработка ошибки WebSocket
     */
    private handleError;
    /**
     * Обработка закрытия соединения
     */
    private handleClose;
    /**
     * Обработка ошибки подключения
     */
    private handleConnectionError;
    /**
     * Закрытие соединения
     */
    private closeConnection;
    /**
     * Планирование попытки переподключения
     */
    private scheduleReconnect;
    /**
     * Запуск heartbeat
     */
    private startHeartbeat;
    /**
     * Отправка сообщений из очереди
     */
    private flushQueue;
    /**
     * Очистка таймаута подключения
     */
    private clearConnectionTimeout;
    /**
     * Установка состояния
     */
    private setState;
    /**
     * Вызов события
     */
    private emit;
    /**
     * Получение URL по умолчанию
     */
    private getDefaultUrl;
    /**
     * Логирование
     */
    private log;
}
//# sourceMappingURL=WebSocketService.d.ts.map