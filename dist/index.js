/**
 * Network Package - Main Entry Point
 *
 * Этот модуль предоставляет все сетевые сервисы и типы для приложения Cognitive Dungeon.
 * Включает WebSocket соединение, управление серверами и все связанные типы.
 */
// ============================================================================
// Core Services
// ============================================================================
export { WebSocketService } from './WebSocketService';
export { ServerManager, DEFAULT_SERVERS } from './ServerManager';
// Protocol
export { serializeClientCommand } from './protocol';
// ============================================================================
// Types - WebSocket Configuration & State
// ============================================================================
export { WebSocketState, WebSocketEvent, DisconnectReason, } from './types';
// ============================================================================
// WebSocket Internal Components (optional, for advanced usage)
// ============================================================================
export { MessageQueue, ConnectionMetrics, HeartbeatManager, ReconnectionManager, } from './websocket';
//# sourceMappingURL=index.js.map