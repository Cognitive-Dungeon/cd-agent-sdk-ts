/**
 * Network Package - Main Entry Point
 *
 * Этот модуль предоставляет все сетевые сервисы и типы для приложения Cognitive Dungeon.
 * Включает WebSocket соединение, управление серверами и все связанные типы.
 */
export { WebSocketService } from './WebSocketService';
export { ServerManager, DEFAULT_SERVERS } from './ServerManager';
export { serializeClientCommand } from './protocol';
export { WebSocketState, WebSocketEvent, DisconnectReason, } from './types';
export type { WebSocketConfig, WebSocketEventListener, WebSocketEventDataMap, SendOptions, SendResult, } from './types';
export type { ConnectedEventData, DisconnectedEventData, MessageEventData, ErrorEventData, ReconnectAttemptEventData, StateChangeEventData, MessageSentEventData, AuthChangeEventData, } from './types';
export type { QueuedMessage, WebSocketMetrics, } from './types';
export type { ClientToServerCommand, ClientToServerAction, CommandAction, CommandPayloadMap, ClientToServerMovePayload, ClientToServerEntityTargetPayload, ClientToServerPositionTargetPayload, ClientToServerUsePayload, ClientToServerDropPayload, ClientToServerItemPayload, ClientToServerTextPayload, ClientToServerCustomPayload, } from './protocol';
export type { ServerInfo, ServerStatus, } from './ServerManager';
export { MessageQueue, ConnectionMetrics, HeartbeatManager, ReconnectionManager, } from './websocket';
//# sourceMappingURL=index.d.ts.map