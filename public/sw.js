if(!self.define){let e,s={};const i=(i,a)=>(i=new URL(i+".js",a).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(a,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let t={};const r=e=>i(e,n),f={module:{uri:n},exports:t,require:r};s[n]=Promise.all(a.map((e=>f[e]||r(e)))).then((e=>(c(...e),t)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"7b2f9de07687058625682585a0ca88ca"},{url:"/_next/static/RMYUiDlR-r-_V_fVch1Qy/_buildManifest.js",revision:"a1b7599199e2e8c82f2c6bcf8d8aca61"},{url:"/_next/static/RMYUiDlR-r-_V_fVch1Qy/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/15-a0daac26fababa3d.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/251-cc5cdb2fcc16eecd.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/3d8f973b-7c1da2c9e4c35cd8.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/458-7ef6f298632142bf.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/665-f208ad828ad30bca.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/763-85e15549b967fdff.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/8e1d74a4-093961a1b07ebc14.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/96-964af4fadd746db8.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/982-17d0eaa3038c2b33.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/_not-found-0abfc60fb76952e2.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/dashboard/page-b1dddf399db73582.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/forgot-password/page-f364f766e27dc3cd.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/layout-738b96baa6975384.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/login/page-663f745d7f1eaada.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/page-7e63ce6b347de99b.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/profile/%5BuserId%5D/page-d714d669d65ba564.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/profile/page-10e85f3133899ae2.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/quests/%5Bid%5D/page-9a8e92d5f483d57d.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/quests/new/page-39a4435de047b20c.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/quests/page-7ed7b4141f46e3db.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/settings/page-5357a07c72992348.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/app/signup/page-0490a7d8140f2dae.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/bc9e92e6-c1e6b3d2a8709155.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/fd9d1056-d402c3289b63a580.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/framework-8883d1e9be70c3da.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/main-a79b0e1865fe7179.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/main-app-fdced4508d71fbcf.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/pages/_app-98cb51ec6f9f135f.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/pages/_error-e87e5963ec1b8011.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-6d134fc4b8c5f5ad.js",revision:"RMYUiDlR-r-_V_fVch1Qy"},{url:"/_next/static/css/c8ad0eadde92fc36.css",revision:"c8ad0eadde92fc36"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/firebase-messaging-sw.js",revision:"b5c1904c11615a59f7f0ec5b55219781"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icon-192x192.png",revision:"611aa1e669e895df4ce2bed0b3e629ab"},{url:"/icon-512x512.png",revision:"611aa1e669e895df4ce2bed0b3e629ab"},{url:"/manifest.json",revision:"eda7be5333ab1359c714fcd092361dc3"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
