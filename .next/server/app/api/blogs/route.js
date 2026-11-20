(()=>{var a={};a.id=49,a.ids=[49],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},332:(a,b,c)=>{"use strict";c.d(b,{Kk:()=>n,Lc:()=>k,To:()=>o,Xi:()=>m,bm:()=>j,sE:()=>p});var d=c(9021),e=c.n(d),f=c(3873),g=c.n(f),h=c(336);let i=e().existsSync("d:/J&F/Maceee/macee-_update_contant")?g().resolve("d:/J&F/Maceee/macee-_update_contant"):g().resolve(process.cwd(),"../macee-_update_contant");function j(){let a=(0,h.lD)("admin.json",{});return a.websitePath&&e().existsSync(a.websitePath)?a.websitePath:i}function k(a){try{let b=j(),c=g().join(b,"src","data");if(!e().existsSync(c))return!1;let d=a.filter(a=>!1!==a.active).sort((a,b)=>(a.order||99)-(b.order||99)).map(a=>{let b={name:a.name,role:a.role,image:a.image||"/images/team-room.jpg"};return a.email&&(b.email=a.email),a.phone&&(b.phone=a.phone),a.linkedin&&(b.linkedin=a.linkedin),a.desk&&(b.desk=a.desk),b}),f=g().join(c,"aboutData.json");if(e().existsSync(f)){let a=JSON.parse(e().readFileSync(f,"utf-8"));a.team||(a.team={}),a.team.members=d,e().writeFileSync(f,JSON.stringify(a,null,2),"utf-8")}let h=g().join(c,"aboutData_nl.json");if(e().existsSync(h)){let a=JSON.parse(e().readFileSync(h,"utf-8"));a.team||(a.team={}),a.team.members=d,e().writeFileSync(h,JSON.stringify(a,null,2),"utf-8")}return!0}catch(a){return console.error("Failed to sync team to website:",a),!1}}function l(a){return null==a?"''":JSON.stringify(a)}function m(a){try{let b=j(),c=g().join(b,"src","data");if(!e().existsSync(c))return!1;let d=(a.items||[]).filter(a=>!1!==a.active),f=a=>d.filter(b=>b.page===a||b.categoryKey===a).sort((a,b)=>(a.order||99)-(b.order||99)),h=a=>a.map(a=>`  {
    question: ${l(a.question)},
    answer:
      ${l(a.answer)},
    tag: ${l(a.tag||"General")},
  }`).join(",\n"),i=`import { FaqItem } from '../components/PageFaqSection';

// ============================================================================
// 1. HOME PAGE FAQS (General Workforce Solutions, Hiring Desk & Compliance)
// ============================================================================
export const HOME_FAQS: FaqItem[] = [
${h(f("home"))}
];

// ============================================================================
// 2. ABOUT PAGE FAQS (Macee Story, Values, Team & Certifications)
// ============================================================================
export const ABOUT_FAQS: FaqItem[] = [
${h(f("about"))}
];

// ============================================================================
// 3. CLIENTS PAGE FAQS (Hiring Managers, SLA, Guarantee & Costs)
// ============================================================================
export const CLIENTS_FAQS: FaqItem[] = [
${h(f("clients"))}
];

// ============================================================================
// 4. PROFESSIONALS PAGE FAQS (Expats, Visas, 30% Ruling & Contracting)
// ============================================================================
export const PROFESSIONALS_FAQS: FaqItem[] = [
${h(f("professionals"))}
];

// ============================================================================
// 5. PROJECTS PAGE FAQS (Job Seekers, Applications, CV & Remote Policy)
// ============================================================================
export const PROJECTS_FAQS: FaqItem[] = [
${h(f("projects"))}
];

// ============================================================================
// 6. CONTACT PAGE FAQS (Response Times, Appointments & Urgencies)
// ============================================================================
export const CONTACT_FAQS: FaqItem[] = [
${h(f("contact"))}
];
`,k=g().join(c,"pageFaqs.ts");e().writeFileSync(k,i,"utf-8");let m=[...d].sort((a,b)=>(a.order||99)-(b.order||99)),n=(a,b=!1)=>{let c=a.page||a.categoryKey||"home",d=(a.pageName||a.pageSource||c).replace(" Page",""),e=b&&a.question_nl||a.question,f=b&&a.answer_nl||a.answer,g=a.categoryName||a.categoryTitle||"General";return`  {
    id: ${l(a.id)},
    categoryKey: ${l(c)},
    categoryTitle: ${l(g)},
    pageSource: ${l(d)},
    question: ${l(e)},
    answer:
      ${l(f)},
    tag: ${l(a.tag||"General")},
  }`},o=m.map(a=>n(a,!1)).join(",\n"),p=m.map(a=>n(a,!0)).join(",\n"),q=`export interface AllFaqItem {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  pageSource: string;
  question: string;
  answer: string;
  tag: string;
}

export interface FaqCategoryDef {
  key: string;
  title: string;
  description: string;
  page: string;
  icon?: string;
  image?: string;
}

export const FAQ_CATEGORIES_EN: FaqCategoryDef[] = [
  {
    key: 'all',
    title: 'All Questions',
    description: 'Browse the complete directory of frequently asked questions across all Macee services.',
    page: 'all',
  },
  {
    key: 'home',
    title: 'Workforce Desk & General',
    description: 'Learn about Macee’s external workforce desk, contract models, and turnkey management.',
    page: 'home',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'about',
    title: 'About Macee & Certifications',
    description: '30+ years of recruitment expertise, Arnhem headquarters, SNA NEN 4400-1 accreditation, and team.',
    page: 'about',
    image: '/uploads/people-working-dsk.jpg',
  },
  {
    key: 'clients',
    title: 'Clients & Hiring Managers',
    description: 'Turnaround SLAs, candidate vetting, quality guarantees, MSP solutions, and fee structures.',
    page: 'clients',
    image: '/uploads/Software-Development-2.jpg',
  },
  {
    key: 'professionals',
    title: 'Professionals & Contractors',
    description: 'Secondment, ZZP brokerage, IND visa sponsorships, 30% tax ruling, and prompt payment cycles.',
    page: 'professionals',
    image: '/uploads/Finance-reporting.jpg',
  },
  {
    key: 'projects',
    title: 'Projects & Vacancies',
    description: 'Applying for assignments, CV formats, recruiter review workflows, and hybrid remote policies.',
    page: 'projects',
    image: '/uploads/PM-2.jpg',
  },
  {
    key: 'compliance',
    title: 'Compliance, Wet DBA & WAADI',
    description: 'Eliminating false self-employment risks, G-account tax protection, and Dutch labor regulations.',
    page: 'compliance',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'contact',
    title: 'Contact & Urgencies',
    description: 'Response times, Arnhem office visits, emergency staffing requests, and confidential consultations.',
    page: 'contact',
    image: '/uploads/people-working-dsk.jpg',
  },
];

export const FAQ_CATEGORIES_NL: FaqCategoryDef[] = [
  {
    key: 'all',
    title: 'Alle Vragen',
    description: 'Bekijk het volledige overzicht van alle veelgestelde vragen over Macee.',
    page: 'all',
  },
  {
    key: 'home',
    title: 'Inhuurdesk & Algemeen',
    description: 'Ontdek hoe Macee’s externe inhuurdesk werkt, contractvormen en flexibele personeelsoplossingen.',
    page: 'home',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'about',
    title: 'Over Macee & Certificeringen',
    description: '30+ jaar recruitmentexpertise, hoofdkantoor Arnhem, SNA NEN 4400-1 accreditatie en ons team.',
    page: 'about',
    image: '/uploads/people-working-dsk.jpg',
  },
  {
    key: 'clients',
    title: 'Voor Opdrachtgevers',
    description: 'Shortlist SLA’s, screening van kandidaten, no-risk vervangingsgarantie en MSP-dienstverlening.',
    page: 'clients',
    image: '/uploads/Software-Development-2.jpg',
  },
  {
    key: 'professionals',
    title: 'Voor Professionals & ZZP’ers',
    description: 'Detachering, ZZP-bemiddeling, IND-kennismigrantenvisa, 30%-regeling en stipte uitbetaling.',
    page: 'professionals',
    image: '/uploads/Finance-reporting.jpg',
  },
  {
    key: 'projects',
    title: 'Vacatures & Solliciteren',
    description: 'Sollicitatieprocedure, gewenste CV-formaten, reactietijden en hybride werkvormen.',
    page: 'projects',
    image: '/uploads/PM-2.jpg',
  },
  {
    key: 'compliance',
    title: 'Compliance, Wet DBA & WAADI',
    description: 'Voorkomen van schijnzelfstandigheid, G-rekening fiscale zekerheid en ketenaansprakelijkheid.',
    page: 'compliance',
    image: '/uploads/Dutch-government-3.jpg',
  },
  {
    key: 'contact',
    title: 'Contact & Spoedaanvragen',
    description: 'Reactietijden, bezoek aan kantoor Arnhem, spoedinterim en vertrouwelijke adviesgesprekken.',
    page: 'contact',
    image: '/uploads/people-working-dsk.jpg',
  },
];

export const ALL_FAQS_EN: AllFaqItem[] = [
${o}
];

export const ALL_FAQS_NL: AllFaqItem[] = [
${p}
];

export function getFullFaqList(lang: 'EN' | 'NL' = 'EN') {
  return lang === 'NL' ? ALL_FAQS_NL : ALL_FAQS_EN;
}

export function getFaqCategories(lang: 'EN' | 'NL' = 'EN') {
  return lang === 'NL' ? FAQ_CATEGORIES_NL : FAQ_CATEGORIES_EN;
}
`,r=g().join(c,"allFaqs.ts");e().writeFileSync(r,q,"utf-8");let s=m.map(a=>({id:a.id,categoryId:a.categoryId||1,categoryName:a.categoryName||"General",question:a.question,answer:a.answer,tag:a.tag,date:a.date||"Updated via Macee Admin"})),t=m.map(a=>({id:a.id,categoryId:a.categoryId||1,categoryName:a.categoryName||"General",question:a.question_nl||a.question,answer:a.answer_nl||a.answer,tag:a.tag,date:a.date||"Bijgewerkt via Macee Admin"})),u=g().join(c,"faqData.json");if(e().existsSync(u)){let b=JSON.parse(e().readFileSync(u,"utf-8"));a.categories&&a.categories.length>0&&(b.categories=a.categories),b.faqs=s,e().writeFileSync(u,JSON.stringify(b,null,2),"utf-8")}let v=g().join(c,"faqData_nl.json");if(e().existsSync(v)){let b=JSON.parse(e().readFileSync(v,"utf-8"));a.categories&&a.categories.length>0&&(b.categories=a.categories),b.faqs=t,e().writeFileSync(v,JSON.stringify(b,null,2),"utf-8")}return!0}catch(a){return console.error("Failed to sync FAQs to website:",a),!1}}function n(a){try{let b=j(),c=g().join(b,"src","data");if(!e().existsSync(c))return!1;let d=g().join(c,"clientsData.json");if(e().existsSync(d)){let b=JSON.parse(e().readFileSync(d,"utf-8"));a.certifications&&(b.certifications||(b.certifications={}),b.certifications.items=a.certifications),a.industries&&(b.industries||(b.industries={}),b.industries.title=a.industries.title,b.industries.subheading=a.industries.subheading,b.industries.paragraphs=Array.isArray(a.industries.description)?a.industries.description:a.industries.description.split("\n\n").filter(Boolean),b.industries.tags=a.industries.tags||[]),a.expertise&&(b.expertise||(b.expertise={}),b.expertise.title=a.expertise.title,b.expertise.subheading=a.expertise.subheading,b.expertise.intro=a.expertise.intro,b.expertise.prompt=a.expertise.prompt,b.expertise.items=(a.expertise.items||[]).map(a=>({domain:a.domain,technologies:a.technologies}))),e().writeFileSync(d,JSON.stringify(b,null,2),"utf-8")}let f=g().join(c,"clientsData_nl.json");if(e().existsSync(f)){let b=JSON.parse(e().readFileSync(f,"utf-8"));a.certifications&&b.certifications&&(b.certifications.items=a.certifications),a.industries&&b.industries&&(b.industries.tags=a.industries.tags),a.expertise&&b.expertise&&(b.expertise.items=a.expertise.items),e().writeFileSync(f,JSON.stringify(b,null,2),"utf-8")}return!0}catch(a){return console.error("Failed to sync clients to website:",a),!1}}function o(a){try{let b=j(),c=g().join(b,"src","data");if(!e().existsSync(c))return!1;let d=g().join(c,"blogsData.json");return e().writeFileSync(d,JSON.stringify(a,null,2),"utf-8"),!0}catch(a){return console.error("Failed to sync blogs to website:",a),!1}}function p(){let a={success:!0,timestamp:new Date().toISOString(),targetDir:j(),filesSynced:[],errors:[]};try{let b=(0,h.lD)("team.json",[]);k(b)?a.filesSynced.push("aboutData.json","aboutData_nl.json"):a.errors.push("Could not sync team members to aboutData.json");let c=(0,h.lD)("faqs.json",{categories:[],items:[]});m(c)?a.filesSynced.push("pageFaqs.ts","allFaqs.ts","faqData.json","faqData_nl.json"):a.errors.push("Could not sync FAQs to pageFaqs.ts and faqData.json");let d=(0,h.lD)("clients.json",{});n(d)?a.filesSynced.push("clientsData.json","clientsData_nl.json"):a.errors.push("Could not sync clients data to clientsData.json");let e=(0,h.lD)("blogs.json",[]);o(e)&&a.filesSynced.push("blogsData.json"),a.success=0===a.errors.length}catch(b){a.success=!1,a.errors.push(b?.message||"Unknown sync error")}return a}},336:(a,b,c)=>{"use strict";c.d(b,{iT:()=>j,lD:()=>i});var d=c(9021),e=c.n(d),f=c(3873),g=c.n(f);function h(){let a=g().resolve("d:/J&F/Maceee/macee-admin-portal/data");if(e().existsSync(a))return a;let b=g().join(process.cwd(),"data");return e().existsSync(b)||e().mkdirSync(b,{recursive:!0}),b}function i(a,b){try{let c=h(),d=g().join(c,a);if(!e().existsSync(d))return j(a,b),b;let f=e().readFileSync(d,"utf-8");return JSON.parse(f)}catch(c){return console.error(`Error reading ${a}:`,c),b}}function j(a,b){try{let c=h(),d=g().join(c,a);return e().writeFileSync(d,JSON.stringify(b,null,2),"utf-8"),!0}catch(b){return console.error(`Error writing ${a}:`,b),!1}}},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3287:()=>{},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:a=>{"use strict";a.exports=require("path")},3930:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>I,patchFetch:()=>H,routeModule:()=>D,serverHooks:()=>G,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>F});var d={};c.r(d),c.d(d,{DELETE:()=>C,GET:()=>z,POST:()=>A,PUT:()=>B});var e=c(8553),f=c(6390),g=c(9261),h=c(2717),i=c(7639),j=c(2187),k=c(261),l=c(9197),m=c(8051),n=c(5717),o=c(9734),p=c(1512),q=c(6802),r=c(9984),s=c(9001),t=c(6439),u=c(8231),v=c(5528),w=c(336),x=c(332);function y(a){return a.toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-")}async function z(a){let{searchParams:b}=new URL(a.url),c=b.get("status"),d=b.get("category"),e=b.get("search")?.toLowerCase()||"",f=(0,w.lD)("blogs.json",[]);return c&&"all"!==c&&(f=f.filter(a=>a.status===c)),d&&"all"!==d&&(f=f.filter(a=>a.category.toLowerCase()===d.toLowerCase())),e&&(f=f.filter(a=>a.title.toLowerCase().includes(e)||a.excerpt.toLowerCase().includes(e)||a.author.toLowerCase().includes(e)||a.tags.some(a=>a.toLowerCase().includes(e)))),f.sort((a,b)=>new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime()),v.NextResponse.json({blogs:f})}async function A(a){try{let b=await a.json(),c=(0,w.lD)("blogs.json",[]),d=b.title||"Untitled Post",e=b.slug?y(b.slug):y(d),f={id:`blog-${Date.now()}`,slug:e,title:d,excerpt:b.excerpt||"",content:b.content||"",category:b.category||"General",author:b.author||"Macee Editorial",coverImage:b.coverImage||"/uploads/people-working-dsk.jpg",tags:Array.isArray(b.tags)?b.tags:(b.tags||"").split(",").map(a=>a.trim()).filter(Boolean),status:"published"===b.status?"published":"draft",readTime:b.readTime||"4 min read",publishedAt:b.publishedAt||new Date().toISOString()};return c.unshift(f),(0,w.iT)("blogs.json",c),(0,x.To)(c),v.NextResponse.json({success:!0,blog:f},{status:201})}catch(a){return v.NextResponse.json({error:"Failed to create blog post"},{status:500})}}async function B(a){try{let b=await a.json(),{id:c}=b;if(!c)return v.NextResponse.json({error:"Missing ID"},{status:400});let d=(0,w.lD)("blogs.json",[]),e=d.findIndex(a=>a.id===c);if(-1===e)return v.NextResponse.json({error:"Blog not found"},{status:404});let f=Array.isArray(b.tags)?b.tags:"string"==typeof b.tags?b.tags.split(",").map(a=>a.trim()).filter(Boolean):d[e].tags;return d[e]={...d[e],...b,tags:f,slug:b.slug?y(b.slug):d[e].slug},(0,w.iT)("blogs.json",d),(0,x.To)(d),v.NextResponse.json({success:!0,blog:d[e]})}catch(a){return v.NextResponse.json({error:"Failed to update blog"},{status:500})}}async function C(a){try{let{searchParams:b}=new URL(a.url),c=b.get("id");if(!c)return v.NextResponse.json({error:"Missing ID"},{status:400});let d=(0,w.lD)("blogs.json",[]);return d=d.filter(a=>a.id!==c),(0,w.iT)("blogs.json",d),(0,x.To)(d),v.NextResponse.json({success:!0})}catch(a){return v.NextResponse.json({error:"Failed to delete blog"},{status:500})}}let D=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/blogs/route",pathname:"/api/blogs",filename:"route",bundlePath:"app/api/blogs/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"D:\\J&F\\Maceee\\macee-admin-portal\\src\\app\\api\\blogs\\route.ts",nextConfigOutput:"",userland:d,...{}}),{workAsyncStorage:E,workUnitAsyncStorage:F,serverHooks:G}=D;function H(){return(0,g.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:F})}async function I(a,b,c){c.requestMeta&&(0,h.setRequestMeta)(a,c.requestMeta),D.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/blogs/route";"/index"===d&&(d="/");let e=await D.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,deploymentId:v,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:C,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,k.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[F]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[F],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.adapterPath)return await K();throw new t.NoFallbackError}}let L=null;!J||D.isDev||z||(L="/index"===(L=F)?"/":L);let M=!0===D.isDev||!J,N=J&&!M;H&&G&&(0,j.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==B?void 0:B.isWrappedByNextServer),S=!!(0,h.getRequestMeta)(a,"minimalMode"),T=(0,h.getRequestMeta)(a,"incrementalCache")||await D.getIncrementalCache(a,x,A,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:w,previewProps:A.preview,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:T,cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>D.onRequestError(a,b,d,e,B)},sharedContext:{buildId:g,deploymentId:v}},V=new l.NodeNextRequest(a),W=new l.NodeNextResponse(b),X=m.NextRequestAdapter.fromNodeNextRequest(V,(0,m.signalFromNodeResponse)(b));try{let e,g=async a=>D.handle(X,U).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==n.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let f=c.get("next.route");if(f){let b=`${O} ${f}`;a.setAttributes({"next.route":f,"http.route":f,"next.span_name":b}),a.updateName(b),e&&e!==a&&(e.setAttribute("http.route",f),e.updateName(b))}else a.updateName(`${O} ${d}`)}),h=async e=>{var h,i;let j=async({previousCacheEntry:f})=>{try{if(!S&&C&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await g(e);a.fetchMetrics=U.renderOpts.fetchMetrics;let h=U.renderOpts.pendingWaitUntil;h&&c.waitUntil&&(c.waitUntil(h),h=void 0);let i=U.renderOpts.collectedTags;if(!J)return await (0,p.I)(V,W,d,U.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,q.toNodeOutgoingHttpHeaders)(d.headers);i&&(b[s.NEXT_CACHE_TAGS_HEADER]=i),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=s.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=s.INFINITE_CACHE?void 0:U.renderOpts.collectedExpire;return{value:{kind:u.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await D.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},!1,B),b}},k=await D.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:E,responseGenerator:j,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return null;if((null==k||null==(h=k.value)?void 0:h.kind)!==u.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==k||null==(i=k.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",C?"REVALIDATED":k.isMiss?"MISS":k.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,q.fromNodeOutgoingHttpHeaders)(k.value.headers);return S&&J||l.delete(s.NEXT_CACHE_TAGS_HEADER),!k.cacheControl||b.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,r.getCacheControlHeader)(k.cacheControl)),await (0,p.I)(V,W,new Response(k.value.body,{headers:l,status:k.value.status||200})),null};R&&Q?await h(Q):(e=P.getActiveScopeSpan(),await P.withPropagatedContext(a.headers,()=>P.trace(n.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},h),void 0,!R))}catch(b){if(b instanceof t.NoFallbackError||await D.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,o.c)({isStaticGeneration:N,isOnDemandRevalidate:C})},!1,B),J)throw b;return await (0,p.I)(V,W,new Response(null,{status:500})),null}}},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},8783:()=>{},9021:a=>{"use strict";a.exports=require("fs")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[463,865],()=>b(b.s=3930));module.exports=c})();