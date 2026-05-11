'use client'

interface Props {
  className?: string
}

const KEY = '5413dd830828ab151edb4c84975f02ff'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`
const WIDTH = 300
const HEIGHT = 250

/**
 * Adsterra 300x250 banner inside an isolated iframe, so each remount
 * re-executes invoke.js cleanly. Use a React `key` prop on the parent to
 * remount this on a timer for impression refresh.
 */
export function AdsterraBanner300x250({ className = '' }: Props) {
  const srcDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;align-items:center;justify-content:center}</style></head>
<body>
<script type="text/javascript">
  atOptions = {
    'key': '${KEY}',
    'format': 'iframe',
    'height': ${HEIGHT},
    'width': ${WIDTH},
    'params': {}
  };
</script>
<script async data-cfasync="false" src="${INVOKE_URL}"></script>
</body></html>`

  return (
    <iframe
      title="Adsterra Banner 300x250"
      className={className}
      srcDoc={srcDoc}
      width={WIDTH}
      height={HEIGHT}
      style={{ border: 0, display: 'block', background: 'transparent' }}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
    />
  )
}
