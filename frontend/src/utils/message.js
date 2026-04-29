/**
 * Global message utility for Ant Design v5.
 *
 * Antd v5 requires `message` to be consumed via `App.useApp()` inside the
 * component tree to respect dynamic theming. Static `message.xxx()` calls
 * still work but produce a console warning.
 *
 * This module exposes a ref-backed proxy so any file can call
 * `appMessage.success(...)` etc. without needing to call `useApp()` in every
 * component. The ref is populated once by `MessageBridge` which must be
 * rendered inside `<App>` (already done in App.js via AntdApp).
 */
import { useEffect } from 'react';
import { App } from 'antd';

// Mutable ref that holds the message API once the bridge mounts
const messageRef = { current: null };

/**
 * Render this component once inside <AntdApp> to wire up the global ref.
 * It is already included in App.js.
 */
export function MessageBridge() {
  const { message } = App.useApp();
  useEffect(() => {
    messageRef.current = message;
  }, [message]);
  return null;
}

/**
 * Proxy object — delegates to the real message API when available,
 * falls back to console.warn so nothing breaks if called before mount.
 */
const appMessage = new Proxy(
  {},
  {
    get(_, method) {
      return (...args) => {
        if (messageRef.current) {
          return messageRef.current[method]?.(...args);
        }
        // Fallback before bridge mounts (should be rare)
        console.warn(`[appMessage] called before bridge mounted: ${method}`, ...args);
      };
    }
  }
);

export default appMessage;
