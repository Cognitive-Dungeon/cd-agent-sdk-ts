/**
 * Protocol Types for Network Package
 *
 * Типы команд, отправляемых клиентом на сервер через WebSocket.
 * Это подмножество типов, необходимых для работы сетевого слоя.
 */
// ============================================================================
// Serialization
// ============================================================================
/**
 * Сериализует команду клиента в JSON строку для отправки по WebSocket
 *
 * @param command - Команда для отправки
 * @returns JSON строка, готовая для отправки через WebSocket.send()
 *
 * @example
 * ```typescript
 * // LOGIN command
 * const loginCommand: ClientToServerCommand = {
 *   action: "LOGIN",
 *   token: "player-entity-id"
 * };
 * socket.send(serializeClientCommand(loginCommand));
 *
 * // MOVE command
 * const moveCommand: ClientToServerCommand = {
 *   action: "MOVE",
 *   payload: { dx: 0, dy: -1 }
 * };
 * socket.send(serializeClientCommand(moveCommand));
 * ```
 */
export function serializeClientCommand(command) {
    return JSON.stringify(command);
}
//# sourceMappingURL=protocol.js.map