'use client'

interface Props {
  className?: string
  /** Width of the iframe in pixels. Defaults to 300. */
  width?: number
  /** Height of the iframe in pixels. Defaults to 250. */
  height?: number
}

const KEY = 'e3d2657564ea75009b5dd5b3a20e6a03'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

/**
 * Adsterra native banner rendered inside an isolated iframe.
 *
 * Why iframe? Adsterra's invoke.js sets globals on the host window during
 * its first execution; on subsequent mounts in the same window context the
 * script appears to short-circuit and the container stays blank. Hosting
 * the ad in an iframe (via srcDoc) gives every remount a fresh window so
 * invoke.js re-executes reliably — making it safe to remount this banner
 * on a timer to boost impressions.
 */
export function AdsterraNativeBanner({
  className = '',
  width = 300,
  height = 380,
}: Props) {
  const srcDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;align-items:flex-start;justify-content:center}</style></head>
<body>
<script type="text/javascript">
  atOptions = {
    'key': '${KEY}',
    'format': 'iframe',
    'height': ${height},
    'width': ${width},
    'params': {}
  };
</script>
<div id="container-${KEY}"></div>
<script async data-cfasync="false" src="${INVOKE_URL}"></script>
</body></html>`

  return (
    <iframe
      title="Adsterra Native Banner"
      className={className}
      srcDoc={srcDoc}
      width={width}
      height={height}
      style={{ border: 0, display: 'block', background: 'transparent' }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    />
  )
}
