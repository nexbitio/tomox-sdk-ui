let ENGINE_HTTP_URL,
  ENGINE_WS_URL,
  TOMOCHAIN_NODE_HTTP_URL,
  TOMOSCAN_URL,
  TOMOTOKENS_URL,
  TOMO_BRIDGE_URL,
  DEFAULT_NETWORK_ID,
  LOCALE,
  REACT_APP_DEX_VERSION,
  DEX_TITLE,
  DEX_LOGO,
  DEX_FAVICON,
  DEX_DOCS_URL,
  DEX_VERSION

const env = window.env || process.env

const WS_PROTOCOL = window.location.protocol.replace('http', 'ws')
const standardizeWSProtocol = url => {
  if (!url) return ''

  if (!url.startsWith('ws')) {
    url = `${WS_PROTOCOL}//${window.location.hostname}/${url.replace(
      /^\/+/,
      ''
    )}`
  }

  return url
}

if (env) {
  ENGINE_HTTP_URL = env.REACT_APP_ENGINE_HTTP_URL
  ENGINE_WS_URL = standardizeWSProtocol(env.REACT_APP_ENGINE_WS_URL)
  TOMOCHAIN_NODE_HTTP_URL = env.REACT_APP_TOMOCHAIN_NODE_HTTP_URL
  TOMOSCAN_URL = env.REACT_APP_TOMOSCAN_URL
  TOMOTOKENS_URL = env.REACT_APP_TOMOTOKENS_URL
  TOMO_BRIDGE_URL = env.REACT_APP_TOMO_BRIDGE_URL
  DEFAULT_NETWORK_ID = env.REACT_APP_DEFAULT_NETWORK_ID || 'default'
  LOCALE = env.REACT_APP_LOCALE || 'en'
  REACT_APP_DEX_VERSION = env.REACT_APP_DEX_VERSION || 'ALPHA'
  DEX_TITLE = env.REACT_APP_TITLE || 'TomoDEX | Decentralized Exchange'
  DEX_LOGO = env.REACT_APP_LOGO
  DEX_FAVICON = env.REACT_APP_FAVICON
  DEX_DOCS_URL = env.REACT_APP_DEX_DOCS_URL || 'https://docs.tomochain.com/tomodex'
  DEX_VERSION = REACT_APP_DEX_VERSION || '1.2.2'
}

export {
  ENGINE_HTTP_URL,
  ENGINE_WS_URL,
  TOMOCHAIN_NODE_HTTP_URL,
  TOMOSCAN_URL,
  TOMOTOKENS_URL,
  TOMO_BRIDGE_URL,
  DEFAULT_NETWORK_ID,
  WS_PROTOCOL,
  LOCALE,
  REACT_APP_DEX_VERSION,
  DEX_TITLE,
  DEX_LOGO,
  DEX_FAVICON,
  DEX_DOCS_URL,
  DEX_VERSION,
}
