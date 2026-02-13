// src/app/dev/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import HeroMedia from "@/components/evergreen/HeroMedia";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

/**
 * Placeholders rápidos para maquetar.
 * Sustituye luego por Cloudinary / tus assets.
 */
const IMG = (id: number, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

// “mismo id, distinto look” (picsum: grayscale/blur)
const IMGQ = (id: number, w = 1600, h = 1000, q = "") =>
  `https://picsum.photos/id/${id}/${w}/${h}${q ? `?${q}` : ""}`;

/** Cover helper para works */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

/** Mini helper “tag OR slug/name” */
function tagOr(slugsOrNames: string[]) {
  return {
    OR: slugsOrNames.flatMap((t) => [{ slug: t }, { name: t }]),
  };
}

type Project = {
  id: string;
  title: string;
  desc: string;
  stack: string[];
  href?: string; // opcional, puede ser live/demo o ruta interna
  repo?: string; // opcional
  shots: { url: string; alt: string }[];
};

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/dev");

  return {
    title: "Dev",
    description:
      "Full Stack + AI + automatización. Herramientas, plataformas y pipelines: menos fricción, más obra.",
    alternates: { canonical },
    openGraph: {
      title: "Dev · elvasco.x",
      description:
        "Full Stack + AI + automatización. Herramientas, plataformas y pipelines: menos fricción, más obra.",
      url: canonical,
      type: "website",
    },
  };
}

export default async function DevPage() {
  const canonical = siteUrl("/dev");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Dev · elvasco.x",
    url: canonical,
    description:
      "Full Stack + AI + automatización. Herramientas, plataformas y pipelines: menos fricción, más obra.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Collection",
      name: "Archivo (Works)",
      url: siteUrl("/work"),
    },
    hasPart: [
      { "@type": "WebPageElement", name: "Manifiesto", url: `${canonical}#manifiesto` },
      { "@type": "WebPageElement", name: "Qué construyo", url: `${canonical}#que` },
      { "@type": "WebPageElement", name: "Web & Platforms", url: `${canonical}#web` },
      { "@type": "WebPageElement", name: "Automations (n8n)", url: `${canonical}#n8n` },
      { "@type": "WebPageElement", name: "AI workflows", url: `${canonical}#ai` },
      { "@type": "WebPageElement", name: "Stack", url: `${canonical}#stack` },
      { "@type": "WebPageElement", name: "GitHub", url: `${canonical}#github` },
      { "@type": "WebPageElement", name: "Contacto", url: `${canonical}#booking` },
    ],
  };

  /**
   * Últimos works relacionados (dev / apps / automation / ai / tooling…)
   * Ajusta tags cuando cierres taxonomía.
   */
  const latestDevWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: tagOr([
            "dev",
            "development",
            "fullstack",
            "webapp",
            "app",
            "tool",
            "tools",
            "automation",
            "automations",
            "n8n",
            "workflow",
            "ai",
            "ia",
            "nextjs",
            "prisma",
            "typescript",
            "docker",
            "script",
            "bot",
          ]),
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      type: true,
      publishedAt: true,
      tags: { include: { tag: true } },
      media: {
        orderBy: { order: "asc" },
        take: 3,
        select: {
          id: true,
          kind: true,
          url: true,
          alt: true,
          width: true,
          height: true,
          isCover: true,
          order: true,
        },
      },
    },
  });

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#que", label: "Qué construyo" },
    { href: "#web", label: "Web & Platforms" },
    { href: "#n8n", label: "Automations (n8n)" },
    { href: "#ai", label: "AI workflows" },
    { href: "#stack", label: "Stack" },
    { href: "#github", label: "GitHub" },
    { href: "#booking", label: "Contacto" },
  ];

  const caminos = [
    {
      k: "web",
      title: "Web & Platforms",
      desc: "Webs y plataformas con sistema editorial, SEO y estructura. Bonitas, rápidas y con intención.",
      tags: ["Next.js", "Prisma", "SEO", "Design system"],
    },
    {
      k: "automation",
      title: "Tools & Automations",
      desc: "Herramientas internas, scripts y workflows para ahorrar tiempo y errores. Aquí es donde se paga solo.",
      tags: ["n8n", "Docker", "FFmpeg", "Integrations"],
    },
    {
      k: "ai",
      title: "AI workflows",
      desc: "IA aplicada, sin humo: asistentes, clasificación, pipelines de contenido y automatización con control.",
      tags: ["Ollama", "RAG", "Agents", "Pipelines"],
    },
  ];

  const projects: Project[] = [
    {
      id: "p1",
      title: "Plataforma Elvasco",
      desc: "Home como hub editorial multifaceta + rutas semánticas, Work/Piece, media, tags y conexiones. Un sistema que convierte creación en archivo vivo.",
      stack: ["Next.js", "TypeScript", "Prisma", "SEO/JSON-LD"],
      href: "/",
      repo: "https://github.com/tu-usuario/tu-repo (placeholder)",
      shots: [
        { url: IMG(1060, 1600, 1000), alt: "Home / Hub (placeholder)" },
        { url: IMG(1040, 1600, 1000), alt: "Work detail (placeholder)" },
        { url: IMG(1032, 1600, 1000), alt: "Blog / editorial (placeholder)" },
      ],
    },
    {
      id: "p2",
      title: "Proyecto Fichas GPT (Work tool)",
      desc: "App interna para gestionar fichas, maestros, escandallos/pedidos, multi-empresa, IA integrada y visor legacy Excel. Hecho para operar, no para lucir.",
      stack: ["Next.js", "Prisma", "SQLite/Postgres", "AI Assist"],
      repo: "https://github.com/tu-usuario/proyecto-fichas (placeholder)",
      shots: [
        { url: IMG(1022, 1600, 1000), alt: "Dashboard (placeholder)" },
        { url: IMG(1025, 1600, 1000), alt: "AI assistant (placeholder)" },
        { url: IMG(1034, 1600, 1000), alt: "Excel preview (placeholder)" },
      ],
    },
    {
      id: "p3",
      title: "Content Pipeline (VideoLab / Automations)",
      desc: "Pipelines para contenido: ingest → selección → copy → export. Menos clicks, más publicar. Lo importante: consistencia y control.",
      stack: ["n8n", "FFmpeg", "Storage", "Templates"],
      repo: "https://github.com/tu-usuario/videolab (placeholder)",
      shots: [
        { url: IMG(1056, 1600, 1000), alt: "Flow overview (placeholder)" },
        { url: IMG(1057, 1600, 1000), alt: "Queue / jobs (placeholder)" },
        { url: IMG(1058, 1600, 1000), alt: "Exports (placeholder)" },
      ],
    },
  ];

  const n8nFlows = [
    {
      id: "f1",
      title: "Inbox → Resumen → Acción",
      desc: "Captura emails/mensajes, resume, crea tareas y te devuelve un plan accionable (sin 200 notificaciones).",
      nodes: ["Trigger", "Filter", "LLM Summarize", "Router", "Slack/Email", "DB/Sheet"],
    },
    {
      id: "f2",
      title: "Contenido: vídeo → highlights → copy → publicación",
      desc: "Transcribe, saca highlights, genera copy adaptado, y lo deja listo para publicar con assets y nombre correcto.",
      nodes: ["Upload", "Transcribe", "Extract", "Template", "Export", "Schedule"],
    },
    {
      id: "f3",
      title: "Operaciones: CSV/Excel → validación → informe",
      desc: "Procesa ficheros, valida datos y genera informes consistentes. Menos errores tontos, más fiabilidad.",
      nodes: ["File Watch", "Parse", "Validate", "Diff", "Report", "Notify"],
    },
  ];

  const aiUseCases = [
    {
      id: "ai1",
      title: "Asistente interno con contexto",
      desc: "Chat con herramientas: consulta fichas, navega, abre acciones. IA útil = IA conectada.",
      badge: "Tool-calling",
    },
    {
      id: "ai2",
      title: "Clasificación y tagging automático",
      desc: "Etiquetado de works/media para archivo y búsquedas sin volverte loco a mano.",
      badge: "Auto-tagging",
    },
    {
      id: "ai3",
      title: "Pipelines creativos controlados",
      desc: "Generación (imagen/video) con reglas: estilo, consistencia, naming, exports limpios.",
      badge: "Controlled gen",
    },
  ];

  const stack = [
    { name: "Next.js + React", note: "App Router, SSR/ISR, componentes reutilizables" },
    { name: "TypeScript", note: "Tipado serio para no pegarte tiros" },
    { name: "Prisma", note: "Modelado + queries + migraciones" },
    { name: "SQLite/Postgres", note: "Depende del entorno (local vs server)" },
    { name: "Docker", note: "Servicios y despliegues ordenados" },
    { name: "Linux", note: "Entorno de trabajo y server" },
    { name: "n8n", note: "Automatizaciones y pipelines" },
    { name: "FFmpeg", note: "Renders, transcodes, automatización de media" },
    { name: "Cloudflare", note: "Tunnels / routing / seguridad (si aplica)" },
    { name: "Ollama / AI tools", note: "IA local + flujos aplicados" },
  ];

  const githubCards = [
    {
      id: "gh1",
      title: "Proyecto Fichas GPT",
      desc: "Next.js + Prisma + multi-empresa + IA + visor Excel legacy.",
      href: "https://github.com/tu-usuario/proyecto-fichas (placeholder)",
      tags: ["nextjs", "prisma", "ai", "tooling"],
    },
    {
      id: "gh2",
      title: "Plataforma Elvasco",
      desc: "Sistema editorial: Work/Piece + media + tags + rutas semánticas.",
      href: "https://github.com/tu-usuario/elvasco-platform (placeholder)",
      tags: ["nextjs", "seo", "cms", "design"],
    },
    {
      id: "gh3",
      title: "Automations / n8n",
      desc: "Workflows: contenido, operaciones, notificaciones, QA y exports.",
      href: "https://github.com/tu-usuario/n8n-flows (placeholder)",
      tags: ["n8n", "automation", "pipelines", "ops"],
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Home
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Dev</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              FULL STACK
            </span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              DEV &amp; A
              <span className="text-red-500">I</span>
            </span>
          </span>
        }
        subtitle={
          <span>
            No programo para posturear. Programo para construir sistemas.
            <span className="text-red-500"> </span>
            Menos fricción. Más obra.
          </span>
        }
      />

      {/* Nav interno sticky */}
      <AnchorNav items={navItems} />

      {/* HERO + manifiesto */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{
            kind: "image",
            url: IMG(1015, 2200, 1200),
            alt: "Dev hero (placeholder)",
          }}
          manifestoTitle="“Si se puede automatizar, no merece repetirse.”"
          manifestoText="El dev para mí es oficio: convertir caos en estructura. Lo mismo que hago con negros y composición, pero en software. Y sí: n8n es mi martillo favorito."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Principios</div>
          <p className="text-zinc-200 font-semibold">
            Velocidad con cabeza. Diseño con intención. Automatización sin perder control.
          </p>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• Si algo depende de “acordarse”, está mal diseñado.</li>
            <li>• Si hay que explicar demasiado una UI, la UI falla.</li>
            <li>• Si la IA no está conectada a herramientas, es solo texto bonito.</li>
          </ul>
        </div>
      </section>

      {/* QUÉ CONSTRUYO */}
      <section id="que" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="que"
          title="Qué construyo"
          desc="Tres caminos. Un mismo objetivo: convertir ideas en sistemas que funcionan."
        />


        <div className="grid gap-4 lg:grid-cols-3">
          {caminos.map((c) => (
            <article
              key={c.k}
              className="rounded-2xl border border-zinc-800 bg-black/30 p-6 hover:border-zinc-600 transition"
            >
              <div className="text-xs uppercase tracking-wide text-zinc-500">Camino</div>
              <div className="mt-2 text-xl font-semibold">{c.title}</div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{c.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
                    {t}
                  </span>
                ))}
                <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                  elvasco.x
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WEB & PLATFORMS */}
      <section id="web" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="web"
          title="Web & Platforms"
          desc="Plataformas que no son escaparate: son archivo vivo, sistema editorial y motor de crecimiento."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: IMG(1031, 1400, 1000),
            alt: "Web platform (placeholder)",
          }}
        >
          <p>
            Me interesa construir plataformas con estructura: contenido, rutas, tags, media, conexiones… lo que hace que una marca
            crezca sin convertirse en un caos. No es “una web bonita”, es un sistema para publicar y organizar.
          </p>
          <p className="text-zinc-400">
            Diseño sobrio, rápido, escalable. El look acompaña, pero el esqueleto manda: SEO, performance, DX, y consistencia.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/25 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Ejemplo de features</div>
            <ul className="mt-2 space-y-2 text-sm text-zinc-400">
              <li>• Modelo transversal Work/Piece + Media/Tags/Connections.</li>
              <li>• Landings por “caminos” (Tattoo/Music/Film/Arte/Dev) con narrativa.</li>
              <li>• SEO semántico + JSON-LD y rutas limpias.</li>
            </ul>
          </div>
        </EditorialBlock>

        {/* Mini “proyectos” con screenshots */}
        <div className="grid gap-4 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
              <div className="relative aspect-[16/10] bg-zinc-950">
                <img
                  src={p.shots[0]?.url ?? IMG(1001, 1600, 1000)}
                  alt={p.shots[0]?.alt ?? p.title}
                  className="h-full w-full object-cover opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-3 right-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Project</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100 leading-tight">{p.title}</div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>

                <div className="flex flex-wrap gap-2 text-xs">
                  {p.stack.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {p.href ? (
                    <Link
                      href={p.href}
                      className="rounded-full border border-zinc-800 bg-black/20 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
                    >
                      Ver →
                    </Link>
                  ) : null}

                  {p.repo ? (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-800 bg-black/20 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
                    >
                      Repo →
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AUTOMATIONS (n8n) */}
      <section id="n8n" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="n8n"
          title="Automations (n8n)"
          desc="Aquí es donde se gana tiempo de verdad: flujos que convierten tareas repetidas en sistema."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <p className="text-zinc-200 leading-relaxed">
            n8n es mi centralita: conecto fuentes, limpio datos, decido reglas, y dejo el output listo. La gracia no es
            “automatizar por automatizar”: es quitar fricción y errores sin perder control.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Siempre diseño con fallback: logs, validaciones y pasos reversibles. Si algo falla, se detecta y se arregla.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {n8nFlows.map((f) => (
            <article key={f.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Workflow</div>
              <div className="text-xl font-semibold">{f.title}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>

              <div className="pt-2">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Nodes (mock)</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {f.nodes.map((n) => (
                    <span key={n} className="rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
                      {n}
                    </span>
                  ))}
                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">n8n</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mock screenshot strip */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
            <div className="relative aspect-[16/10] bg-zinc-950">
              <img
                src={IMGQ(1042, 1600, 1000, "grayscale")}
                alt="n8n canvas (placeholder)"
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute left-4 bottom-3 right-4">
                <div className="text-xs uppercase tracking-wide text-zinc-400">n8n canvas</div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">Orquestación · validación · logs</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
            <div className="relative aspect-[16/10] bg-zinc-950">
              <img
                src={IMGQ(1042, 1600, 1000, "blur=2")}
                alt="n8n logs (placeholder)"
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute left-4 bottom-3 right-4">
                <div className="text-xs uppercase tracking-wide text-zinc-400">Observabilidad</div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">Debug rápido sin romper producción</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI WORKFLOWS */}
      <section id="ai" className="scroll-mt-24 space-y-6">
        <SectionHeading id="ai" title="AI workflows" desc="IA aplicada, sin fantasía: conectada a herramientas, con reglas, y con salida utilizable." />

        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: IMG(1039, 1400, 1000),
            alt: "AI workflows (placeholder)",
          }}
        >
          <p>
            La IA que me interesa es la que trabaja contigo: resume, clasifica, propone, y ejecuta acciones cuando tiene permisos. No me vale
            “chat bonito”: tiene que estar integrado con datos, rutas y herramientas.
          </p>
          <p className="text-zinc-400">
            Mi enfoque: prompts claros, tool-calling cuando toca, validación y logs. Si una salida no es utilizable, no existe.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {aiUseCases.map((u) => (
              <div key={u.id} className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">{u.badge}</div>
                <div className="mt-2 text-sm font-semibold text-zinc-100">{u.title}</div>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </EditorialBlock>
      </section>

      {/* STACK */}
      <section id="stack" className="scroll-mt-24 space-y-6">
        <SectionHeading id="stack"  title="Stack" desc="Herramientas que uso de verdad. Lo importante es el ojo y el sistema." />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((t) => (
            <div key={t.name} className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <div className="text-sm font-semibold text-zinc-100">{t.name}</div>
              <div className="mt-2 text-sm text-zinc-400">{t.note}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Nota</div>
          <p className="mt-2 text-zinc-400 leading-relaxed">
            No vendo “tecnología”. Vendo resultado: menos fricción, más consistencia, más control. Y sí: si algo se puede automatizar sin perder calidad,
            lo automatizo.
          </p>
        </div>
      </section>

      {/* GITHUB */}
      <section id="github" className="scroll-mt-24 space-y-6">
        <SectionHeading id="github"  title="GitHub" desc="Preview rápida (manual). Luego lo conectamos con API cuando quieras." />

        <div className="grid gap-4 lg:grid-cols-3">
          {githubCards.map((g) => (
            <a
              key={g.id}
              href={g.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-zinc-800 bg-black/30 p-6 hover:border-zinc-600 transition"
            >
              <div className="text-xs uppercase tracking-wide text-zinc-500">repo</div>
              <div className="mt-2 text-xl font-semibold">{g.title}</div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{g.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {g.tags.map((t) => (
                  <span key={t} className="rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
                    {t}
                  </span>
                ))}
                <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">GitHub</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto / Colaboraciones"
          desc="Webs, apps internas, automatizaciones (n8n), pipelines de contenido o IA aplicada. Si quieres algo útil y bien hecho: hablamos."
          primaryHref="/contacto"
          primaryLabel="Contacto"
          secondaryHref="https://www.instagram.com/elvasco.x"
          secondaryLabel="Instagram"
          aside={
            <div className="space-y-3">
              <div className="text-sm text-zinc-400">
                <span className="text-zinc-200 font-semibold">elvasco</span>
                <span className="text-red-500">.</span>
                <span className="text-red-500">x</span>
                <span className="text-zinc-600"> · </span>
                <span className="text-zinc-500">Underground by choice</span>
                <span className="text-red-500"> ✖️</span>
              </div>

              <div className="text-xs text-zinc-500">Redes:</div>

              <div className="flex flex-col gap-2 text-sm">
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://www.instagram.com/elvasco.x"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://youtube.com/@elvasco.x"
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </a>
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://github.com/tu-usuario (placeholder)"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          }
        />
      </section>

      {/* Últimos works relacionados */}
      {latestDevWorks.length ? (
        <section className="pt-2 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works relacionados</div>
            </div>

            <Link href="/work" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestDevWorks.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? []).slice(0, 3).map((t) => t.tag.name);

              return (
                <Link
                  key={w.id}
                  href={`/work/${w.slug}`}
                  className="rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition"
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                      <MediaRenderer media={cover as any} className="h-full w-full" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" />
                  )}

                  <div className="mt-3 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {w.type}
                      {w.publishedAt ? (
                        <span className="text-zinc-600"> · {new Date(w.publishedAt).toLocaleDateString()}</span>
                      ) : null}
                    </div>

                    <div className="font-semibold leading-tight">{w.title}</div>

                    {w.excerpt ? <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p> : null}

                    {tagNames.length ? (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {tagNames.map((t) => (
                          <span key={t} className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
