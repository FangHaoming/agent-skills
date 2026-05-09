export type JsonRpcId = string | number | null

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: JsonRpcId
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcSuccessResponse {
  jsonrpc: '2.0'
  id: JsonRpcId
  result: unknown
}

export interface JsonRpcErrorResponse {
  jsonrpc: '2.0'
  id: JsonRpcId
  error: {
    code: number
    message: string
    data?: unknown
  }
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse

export const JSON_RPC_VERSION = '2.0'

export function createSuccessResponse(
  id: JsonRpcId,
  result: unknown,
): JsonRpcSuccessResponse {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id,
    result,
  }
}

export function createErrorResponse(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcErrorResponse {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id,
    error: {
      code,
      message,
      data,
    },
  }
}

export function writeMessage(message: JsonRpcResponse): void {
  const body = JSON.stringify(message)
  const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`
  process.stdout.write(header + body)
}

export function tryReadMessages(
  buffer: Buffer,
): { messages: JsonRpcRequest[]; remaining: Buffer } {
  const messages: JsonRpcRequest[] = []
  let offset = 0

  while (offset < buffer.length) {
    const headerEnd = buffer.indexOf('\r\n\r\n', offset, 'utf8')

    if (headerEnd === -1) {
      break
    }

    const headerText = buffer.slice(offset, headerEnd).toString('utf8')
    const contentLengthLine = headerText
      .split('\r\n')
      .find((line) => line.toLowerCase().startsWith('content-length:'))

    if (!contentLengthLine) {
      throw new Error('Missing Content-Length header')
    }

    const contentLength = Number(contentLengthLine.split(':')[1]?.trim())

    if (!Number.isFinite(contentLength) || contentLength < 0) {
      throw new Error('Invalid Content-Length header')
    }

    const bodyStart = headerEnd + 4
    const bodyEnd = bodyStart + contentLength

    if (bodyEnd > buffer.length) {
      break
    }

    const bodyText = buffer.slice(bodyStart, bodyEnd).toString('utf8')
    messages.push(JSON.parse(bodyText) as JsonRpcRequest)
    offset = bodyEnd
  }

  return {
    messages,
    remaining: buffer.slice(offset),
  }
}
