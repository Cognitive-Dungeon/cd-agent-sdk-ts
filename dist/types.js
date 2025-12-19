/**
 * Типы для WebSocket сервиса
 *
 * Этот файл содержит все типы, используемые WebSocketService
 * для типобезопасной работы с WebSocket соединением.
 *
 * Некоторые типы теперь определены в модулях websocket/ и реэкспортируются здесь
 * для обратной совместимости.
 */
/**
 * Состояние WebSocket соединения
 */
export var WebSocketState;
(function (WebSocketState) {
    /** Соединение устанавливается */
    WebSocketState["CONNECTING"] = "CONNECTING";
    /** Соединение установлено */
    WebSocketState["CONNECTED"] = "CONNECTED";
    /** Соединение закрывается */
    WebSocketState["CLOSING"] = "CLOSING";
    /** Соединение закрыто */
    WebSocketState["CLOSED"] = "CLOSED";
    /** Происходит попытка переподключения */
    WebSocketState["RECONNECTING"] = "RECONNECTING";
})(WebSocketState || (WebSocketState = {}));
/**
 * Причина закрытия соединения
 */
export var DisconnectReason;
(function (DisconnectReason) {
    /** Соединение закрыто вручную (через disconnect()) */
    DisconnectReason["MANUAL"] = "MANUAL";
    /** Ошибка сети */
    DisconnectReason["NETWORK_ERROR"] = "NETWORK_ERROR";
    /** Сервер закрыл соединение */
    DisconnectReason["SERVER_CLOSED"] = "SERVER_CLOSED";
    /** Таймаут соединения */
    DisconnectReason["TIMEOUT"] = "TIMEOUT";
    /** Превышено максимальное количество попыток переподключения */
    DisconnectReason["MAX_RETRIES_EXCEEDED"] = "MAX_RETRIES_EXCEEDED";
    /** Неизвестная причина */
    DisconnectReason["UNKNOWN"] = "UNKNOWN";
})(DisconnectReason || (DisconnectReason = {}));
/**
 * События, генерируемые WebSocketService
 */
export var WebSocketEvent;
(function (WebSocketEvent) {
    /** Соединение установлено */
    WebSocketEvent["CONNECTED"] = "connected";
    /** Соединение закрыто */
    WebSocketEvent["DISCONNECTED"] = "disconnected";
    /** Получено сообщение от сервера */
    WebSocketEvent["MESSAGE"] = "message";
    /** Произошла ошибка */
    WebSocketEvent["ERROR"] = "error";
    /** Начата попытка переподключения */
    WebSocketEvent["RECONNECT_ATTEMPT"] = "reconnect_attempt";
    /** Изменилось состояние соединения */
    WebSocketEvent["STATE_CHANGE"] = "state_change";
    /** Отправлено сообщение на сервер */
    WebSocketEvent["MESSAGE_SENT"] = "message_sent";
    /** Изменился статус аутентификации */
    WebSocketEvent["AUTH_CHANGE"] = "auth_change";
})(WebSocketEvent || (WebSocketEvent = {}));
//# sourceMappingURL=types.js.map