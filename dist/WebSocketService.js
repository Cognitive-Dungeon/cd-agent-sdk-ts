/**
 * WebSocketService - Сервис для управления WebSocket соединением
 *
 * Рефакторенная версия с использованием модульных компонентов:
 * - MessageQueue - очередь сообщений
 * - ConnectionMetrics - сбор метрик
 * - HeartbeatManager - heartbeat пинги
 * - ReconnectionManager - переподключение
 */
import { serializeClientCommand } from "./protocol";
import { WebSocketState, WebSocketEvent, DisconnectReason, } from "./types";
import { MessageQueue, ConnectionMetrics, HeartbeatManager, ReconnectionManager, } from "./websocket";
// ============================================================================
// Default Configuration
// ============================================================================
const DEFAULT_CONFIG = {
    url: "",
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
    maxReconnectDelay: 30000,
    reconnectDelayMultiplier: 1.5,
    connectionTimeout: 10000,
    heartbeatInterval: 0, // Disabled by default (0 = off)
    heartbeatTimeout: 10000,
    autoReconnect: true,
    maxQueueSize: 100,
    debug: false,
};
// ============================================================================
// WebSocketService Class
// ============================================================================
export class WebSocketService {
    config;
    socket = null;
    state = WebSocketState.CLOSED;
    isAuthenticated = false;
    // Modular components
    messageQueue;
    metrics;
    heartbeat;
    reconnection;
    // Connection timeout
    connectionTimeoutId = null;
    // Event listeners
    // fixme:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listeners = new Map();
    // Flags
    isManualDisconnect = false;
    isDestroyed = false;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Initialize modular components
        this.messageQueue = new MessageQueue({
            maxSize: this.config.maxQueueSize,
            debug: this.config.debug,
        });
        this.metrics = new ConnectionMetrics({
            debug: this.config.debug,
        });
        this.heartbeat = new HeartbeatManager({
            interval: this.config.heartbeatInterval,
            timeout: this.config.heartbeatTimeout,
            debug: this.config.debug,
        });
        this.reconnection = new ReconnectionManager({
            maxAttempts: this.config.maxReconnectAttempts,
            initialDelay: this.config.reconnectDelay,
            maxDelay: this.config.maxReconnectDelay,
            delayMultiplier: this.config.reconnectDelayMultiplier,
            debug: this.config.debug,
        });
        this.log("WebSocketService initialized with config:", this.config);
    }
    // ============================================================================
    // Public Methods - Connection
    // ============================================================================
    /**
     * Подключение к WebSocket серверу
     */
    connect() {
        if (this.isDestroyed) {
            throw new Error("WebSocketService has been destroyed");
        }
        if (this.state === WebSocketState.CONNECTING || this.state === WebSocketState.CONNECTED) {
            this.log("Already connected or connecting");
            return;
        }
        this.isManualDisconnect = false;
        this.setState(WebSocketState.CONNECTING);
        this.createConnection();
    }
    /**
     * Отключение от WebSocket сервера
     */
    disconnect() {
        this.isManualDisconnect = true;
        this.reconnection.cancel();
        this.heartbeat.stop();
        this.closeConnection(DisconnectReason.MANUAL);
    }
    // ============================================================================
    // Public Methods - Messaging
    // ============================================================================
    /**
     * Отправка команды на сервер
     */
    send(command, options = {}) {
        const timestamp = Date.now();
        // Проверка состояния соединения
        if (this.state !== WebSocketState.CONNECTED) {
            if (options.queue !== false && !this.messageQueue.isFull) {
                // Добавляем в очередь
                this.messageQueue.enqueue(command, {
                    onSuccess: options.onSuccess,
                    onError: options.onError,
                });
                return {
                    success: false,
                    queued: true,
                    timestamp,
                };
            }
            else {
                const error = "Not connected to server";
                if (options.onError) {
                    options.onError(new Error(error));
                }
                return {
                    success: false,
                    queued: false,
                    error,
                    timestamp,
                };
            }
        }
        try {
            const serialized = serializeClientCommand(command);
            if (this.socket) {
                this.socket.send(serialized);
            }
            // Обновляем метрики
            this.metrics.recordMessageSent();
            // Вызываем события
            this.emit(WebSocketEvent.MESSAGE_SENT, {
                command,
                serialized,
                timestamp,
            });
            if (options.onSuccess) {
                options.onSuccess();
            }
            this.log("Message sent:", command.action);
            return {
                success: true,
                queued: false,
                timestamp,
            };
        }
        catch (error) {
            this.metrics.recordError();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit(WebSocketEvent.ERROR, {
                type: "send",
                message: `Failed to send message: ${errorMessage}`,
                error: error instanceof Error ? error : undefined,
                timestamp,
            });
            if (options.onError) {
                options.onError(error instanceof Error ? error : new Error(errorMessage));
            }
            return {
                success: false,
                queued: false,
                error: errorMessage,
                timestamp,
            };
        }
    }
    // ============================================================================
    // Public Methods - Event System
    // ============================================================================
    /**
     * Подписка на событие
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.add(listener);
        }
    }
    /**
     * Отписка от события
     */
    off(event, listener) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    /**
     * Однократная подписка на событие
     */
    once(event, listener) {
        const onceWrapper = (data) => {
            listener(data);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }
    // ============================================================================
    // Public Methods - Authentication
    // ============================================================================
    /**
     * Установка статуса аутентификации
     */
    setAuthenticated(isAuthenticated) {
        if (this.isAuthenticated !== isAuthenticated) {
            this.isAuthenticated = isAuthenticated;
            this.emit(WebSocketEvent.AUTH_CHANGE, {
                isAuthenticated,
                timestamp: Date.now(),
            });
            this.log(`Authentication status changed: ${isAuthenticated}`);
        }
    }
    // ============================================================================
    // Public Methods - State & Metrics
    // ============================================================================
    /**
     * Получение текущего состояния
     */
    getState() {
        return this.state;
    }
    /**
     * Проверка подключения
     */
    isConnected() {
        return this.state === WebSocketState.CONNECTED;
    }
    /**
     * Проверка аутентификации
     */
    isAuth() {
        return this.isAuthenticated;
    }
    /**
     * Получение метрик
     */
    getMetrics() {
        // Обновляем внешние данные в метриках
        this.metrics.setQueueSize(this.messageQueue.size);
        this.metrics.setReconnectDelay(this.reconnection.delay);
        return this.metrics.getMetrics();
    }
    /**
     * Очистка очереди сообщений
     */
    clearQueue() {
        this.messageQueue.clear();
        this.log("Message queue cleared");
    }
    /**
     * Уничтожение сервиса
     */
    destroy() {
        this.isDestroyed = true;
        this.disconnect();
        this.listeners.clear();
        this.messageQueue.clear();
        this.log("WebSocketService destroyed");
    }
    // ============================================================================
    // Private Methods - Connection
    // ============================================================================
    /**
     * Создание WebSocket соединения
     */
    createConnection() {
        try {
            const url = this.config.url || this.getDefaultUrl();
            this.log(`Connecting to ${url}`);
            this.socket = new WebSocket(url);
            // Установка таймаута подключения
            this.connectionTimeoutId = window.setTimeout(() => {
                if (this.state === WebSocketState.CONNECTING) {
                    this.log("Connection timeout");
                    this.handleConnectionError(DisconnectReason.TIMEOUT);
                }
            }, this.config.connectionTimeout);
            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);
            this.socket.onerror = this.handleError.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
        }
        catch (error) {
            this.metrics.recordError();
            this.log("Failed to create WebSocket:", error);
            this.handleConnectionError(DisconnectReason.NETWORK_ERROR);
        }
    }
    /**
     * Обработка открытия соединения
     */
    handleOpen() {
        this.clearConnectionTimeout();
        this.setState(WebSocketState.CONNECTED);
        const timestamp = Date.now();
        this.metrics.recordConnect();
        // Записываем успешное переподключение
        if (this.reconnection.attemptCount > 0) {
            this.metrics.recordReconnectSuccess();
        }
        const attempts = this.reconnection.attemptCount;
        // Сбрасываем состояние переподключения
        this.reconnection.reset();
        this.emit(WebSocketEvent.CONNECTED, {
            timestamp,
            attempts,
        });
        this.log(`Connected (attempts: ${attempts})`);
        // Запуск heartbeat
        this.startHeartbeat();
        // Отправка сообщений из очереди
        this.flushQueue();
    }
    /**
     * Обработка входящего сообщения
     */
    handleMessage(event) {
        const timestamp = Date.now();
        this.metrics.recordMessageReceived();
        try {
            const rawData = event.data;
            const data = JSON.parse(rawData);
            // Обработка heartbeat ответа
            if (typeof data === "object" && data !== null && "type" in data) {
                const messageData = data;
                if (messageData.type === "PONG") {
                    this.heartbeat.handlePong();
                    return;
                }
                this.emit(WebSocketEvent.MESSAGE, {
                    data,
                    timestamp,
                    raw: rawData,
                });
                this.log("Message received:", messageData.type || "unknown");
            }
            else {
                this.emit(WebSocketEvent.MESSAGE, {
                    data,
                    timestamp,
                    raw: rawData,
                });
                this.log("Message received: unknown");
            }
        }
        catch (error) {
            this.metrics.recordError();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit(WebSocketEvent.ERROR, {
                type: "parse",
                message: `Failed to parse message: ${errorMessage}`,
                error: error instanceof Error ? error : undefined,
                timestamp,
            });
        }
    }
    /**
     * Обработка ошибки WebSocket
     */
    handleError() {
        // Детали ошибки недоступны в браузерном WebSocket API
        // Реальная ошибка придет через onclose
        this.log("WebSocket error occurred");
    }
    /**
     * Обработка закрытия соединения
     */
    handleClose(event) {
        this.clearConnectionTimeout();
        this.heartbeat.stop();
        const timestamp = Date.now();
        this.metrics.recordDisconnect();
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = false;
        let reason = DisconnectReason.UNKNOWN;
        if (this.isManualDisconnect) {
            reason = DisconnectReason.MANUAL;
        }
        else if (event.code === 1006) {
            reason = DisconnectReason.NETWORK_ERROR;
        }
        else if (event.code >= 1000 && event.code < 1004) {
            reason = DisconnectReason.SERVER_CLOSED;
        }
        this.setState(WebSocketState.CLOSED);
        this.emit(WebSocketEvent.DISCONNECTED, {
            reason,
            code: event.code,
            reasonText: event.reason,
            wasAuthenticated,
            timestamp,
        });
        this.log(`Disconnected (code: ${event.code}, reason: ${reason})`);
        // Попытка переподключения
        if (!this.isManualDisconnect && this.config.autoReconnect) {
            this.scheduleReconnect();
        }
    }
    /**
     * Обработка ошибки подключения
     */
    handleConnectionError(reason) {
        this.closeConnection(reason);
    }
    /**
     * Закрытие соединения
     */
    closeConnection(reason) {
        this.clearConnectionTimeout();
        this.heartbeat.stop();
        if (this.socket) {
            try {
                this.socket.close(1000, reason);
            }
            catch (error) {
                this.log("Error closing socket:", error);
            }
            this.socket = null;
        }
        if (this.state !== WebSocketState.CLOSED) {
            this.setState(WebSocketState.CLOSED);
        }
    }
    // ============================================================================
    // Private Methods - Reconnection
    // ============================================================================
    /**
     * Планирование попытки переподключения
     */
    scheduleReconnect() {
        this.setState(WebSocketState.RECONNECTING);
        this.reconnection.schedule(
        // Функция переподключения
        () => this.connect(), 
        // Callback при попытке
        (attempt, maxAttempts, delay) => {
            this.metrics.recordReconnectAttempt();
            this.emit(WebSocketEvent.RECONNECT_ATTEMPT, {
                attempt,
                maxAttempts,
                delay,
                timestamp: Date.now(),
            });
            this.log(`Reconnecting in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        }, 
        // Callback при исчерпании попыток
        () => {
            this.log("Max reconnect attempts reached");
            this.emit(WebSocketEvent.ERROR, {
                type: "connection",
                message: "Maximum reconnection attempts exceeded",
                timestamp: Date.now(),
            });
        });
    }
    // ============================================================================
    // Private Methods - Heartbeat
    // ============================================================================
    /**
     * Запуск heartbeat
     */
    startHeartbeat() {
        if (!this.heartbeat.enabled) {
            this.log("Heartbeat disabled");
            return;
        }
        this.heartbeat.start(
        // Функция отправки ping
        () => {
            if (!this.isConnected() || !this.socket) {
                return false;
            }
            try {
                this.socket.send(JSON.stringify({ type: "PING" }));
                return true;
            }
            catch {
                return false;
            }
        }, 
        // Callback при таймауте
        () => {
            this.log("Heartbeat timeout - connection may be dead");
            this.handleConnectionError(DisconnectReason.TIMEOUT);
        }, 
        // Callback при получении pong
        (latency) => {
            this.metrics.recordLatency(latency);
            this.log(`Heartbeat received (latency: ${latency}ms)`);
        });
        this.log("Heartbeat started");
    }
    // ============================================================================
    // Private Methods - Message Queue
    // ============================================================================
    /**
     * Отправка сообщений из очереди
     */
    flushQueue() {
        if (this.messageQueue.isEmpty) {
            return;
        }
        this.log(`Flushing message queue (${this.messageQueue.size} messages)`);
        const messages = this.messageQueue.flush();
        for (const message of messages) {
            const result = this.send(message.command, {
                onSuccess: message.onSuccess,
                onError: message.onError,
            });
            if (!result.success && !result.queued) {
                this.log(`Failed to send queued message: ${result.error}`);
            }
        }
    }
    // ============================================================================
    // Private Methods - Utilities
    // ============================================================================
    /**
     * Очистка таймаута подключения
     */
    clearConnectionTimeout() {
        if (this.connectionTimeoutId) {
            clearTimeout(this.connectionTimeoutId);
            this.connectionTimeoutId = null;
        }
    }
    /**
     * Установка состояния
     */
    setState(newState) {
        if (this.state === newState) {
            return;
        }
        const previousState = this.state;
        this.state = newState;
        this.emit(WebSocketEvent.STATE_CHANGE, {
            previousState,
            currentState: newState,
            timestamp: Date.now(),
        });
        this.log(`State changed: ${previousState} -> ${newState}`);
    }
    /**
     * Вызов события
     */
    emit(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach((listener) => {
                try {
                    listener(data);
                }
                catch (error) {
                    this.log(`Error in ${event} listener:`, error);
                }
            });
        }
    }
    /**
     * Получение URL по умолчанию
     */
    getDefaultUrl() {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const isDev = window.location.port === "3000";
        if (isDev) {
            // Development: используем Vite proxy
            return `${protocol}//${window.location.host}/ws`;
        }
        else {
            // Production: подключаемся напрямую к backend (порт 8080)
            const backendHost = window.location.hostname;
            const backendPort = "8080";
            return `${protocol}//${backendHost}:${backendPort}/ws`;
        }
    }
    /**
     * Логирование
     */
    log(...args) {
        if (this.config.debug) {
            // eslint-disable-next-line no-console
            console.log("[WebSocketService]", ...args);
        }
    }
}
//# sourceMappingURL=WebSocketService.js.map