if(!self.define){let e,s={};const i=(i,t)=>(i=new URL(i+".js",t).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(t,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const r=e=>i(e,a),p={module:{uri:a},exports:c,require:r};s[a]=Promise.all(t.map((e=>p[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"ea3351dda178abcca04126c6ade75969"},{url:"/_next/static/SpbtiAEkRI4_ZSpq72sSv/_buildManifest.js",revision:"e50bd43c906648e2a1ccbe057d6ceadb"},{url:"/_next/static/SpbtiAEkRI4_ZSpq72sSv/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/117-b264cd36c80dbeb0.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/15-3356ae6ee4419490.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/191-36bd9fa2298288ae.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/247-b5de93023eb58896.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/458-932fc57891512494.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/463-7fb076ffe87f51d2.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/490-de2f77ec94ada8a8.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/638-c467fe1404b04cac.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/7aa4777d-ddcd00580da4b4dc.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/808-afd5a315629b4565.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/834cb1aa-7f5fc62065ba63b8.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/850-565bd9c5193604be.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/8e1d74a4-b34de4d3b1766134.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/985-53b4e6a86fb50b61.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/_not-found-060aa833eb020085.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/dashboard/page-f7b543e018097cc2.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/forgot-password/page-64e1287998055604.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/layout-644b09b357c665e0.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/login/page-114345f934a3bb47.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/page-94d9803d83303dfa.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/profile/%5BuserId%5D/page-651b742aa4505af9.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/profile/page-71ad952cd8d9ba86.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/quests/%5Bid%5D/page-199ef926e20196dd.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/quests/new/page-88207ebb2e4d1b17.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/quests/page-1638fe34346f3ca1.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/settings/page-d1cd8a25b1ad9f48.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/app/signup/page-d5cbcba495f792cd.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/bc9e92e6-c4141c404fc7d7b0.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/fd9d1056-b431403561b9ba3f.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/framework-0d01cdd3f4d700bf.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/main-app-d306dafc8bfc54f9.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/main-c0c1db5c42b49ee7.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/pages/_app-8e650e1c50ef0819.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/pages/_error-0ffac66cb3fae446.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-49d3b0cfa951b953.js",revision:"SpbtiAEkRI4_ZSpq72sSv"},{url:"/_next/static/css/4971db9f93b2c782.css",revision:"4971db9f93b2c782"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/firebase-messaging-sw.js",revision:"b5c1904c11615a59f7f0ec5b55219781"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icon-192x192.png",revision:"611aa1e669e895df4ce2bed0b3e629ab"},{url:"/icon-512x512.png",revision:"611aa1e669e895df4ce2bed0b3e629ab"},{url:"/manifest.json",revision:"eda7be5333ab1359c714fcd092361dc3"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
