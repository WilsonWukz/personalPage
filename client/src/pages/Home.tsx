/*
 * Design: 「纸质档案馆」Paper Archive
 * Background: #EEEBE5 亚麻白 | Font: Geist Mono (标题/编号) + Noto Sans SC (正文)
 * Color: #1C1C1C 近黑 | #6B6966 暖灰 | #2A1810 深棕(hover) | #D4C9B8 边框
 * Layout: 单列窄宽 680px，左对齐，大量留白
 * Animation: 粒子拓扑图（260×260），静态背景图 + 动态连线粒子
 * Ref: mmguo.dev — minimal, airy, illustration-like
 */
import { useRef } from "react";
import { useParticles } from "@/hooks/useParticles";

// ── Skills 数据（来自 WilsonWukz/MySkills）──
const skills = [
  {
    name: "Paper Visualizer",
    slug: "visual-architect",
    desc: "将研究论文或者做图思路转化为高精度视觉架构图。",
    github: "https://github.com/WilsonWukz/MySkills/tree/main/skills/visual-architect",
    tag: "Vision",
  },
  {
    name: "Humanizer",
    slug: "humanizer",
    desc: "将机械感文本重构为自然人类写作。",
    github: "https://github.com/WilsonWukz/MySkills/tree/main/skills/humanizer",
    tag: "Writing",
  },
  {
    name: "Human Writing Assistant",
    slug: "human-writing-assistant",
    desc: "从零起草就避免合成感的写作助手。",
    github: "https://github.com/WilsonWukz/MySkills/tree/main/skills/human-writing-assistant",
    tag: "Writing",
  },
];

// ── 版块标题组件 ──
function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.25rem",
      }}
    >
      <span
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: "0.72rem",
          fontWeight: 500,
          color: "#9A9590",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "#D4C9B8",
        }}
      />
    </div>
  );
}

// ── 粒子 Canvas 组件 ──
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef);
  return (
    <div
      style={{
        position: "relative",
        width: "380px",
        height: "380px",
        margin: "2.5rem 0 1rem -0.5rem",
      }}
    >
      {/* 静态背景图（生成的粒子图） */}
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663268129420/T9TUsmpcgx7z7MvsaXDFXD/hero-particles-dDn9vkfHoWKcWbVoR7wKbY.webp"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.55,
          maskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 72%)",
        }}
      />
      {/* 动态粒子层 */}
      <canvas
        ref={canvasRef}
        width={380}
        height={380}
        style={{ position: "absolute", inset: 0, opacity: 0.75 }}
        aria-hidden="true"
      />
    </div>
  );
}

// ── 链接组件 ──
function ContentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#1C1C1C",
        textDecoration: "underline",
        textDecorationStyle: "dashed",
        textUnderlineOffset: "3px",
        textDecorationColor: "#D4C9B8",
        transition: "color 150ms ease, text-decoration-color 150ms ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#2A1810";
        el.style.textDecorationStyle = "solid";
        el.style.textDecorationColor = "#2A1810";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "#1C1C1C";
        el.style.textDecorationStyle = "dashed";
        el.style.textDecorationColor = "#D4C9B8";
      }}
    >
      {children}
    </a>
  );
}

// ── GitHub 图标 ──
function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EEEBE5",
        fontFamily: "'Noto Sans SC', 'Inter', sans-serif",
      }}
    >
      {/* ── 顶部通知栏 ── */}
      <div style={{ borderBottom: "1px solid #D4C9B8", padding: "0.55rem 0" }}>
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.68rem",
              color: "#6B6966",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <span>2025.04</span>
            <a
              href="https://github.com/WilsonWukz/MySkills"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1C1C1C",
                textDecoration: "underline dashed",
                textUnderlineOffset: "2px",
                textDecorationColor: "#D4C9B8",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#2A1810";
                el.style.textDecorationStyle = "solid";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "#1C1C1C";
                el.style.textDecorationStyle = "dashed";
              }}
            >
              MySkills 仓库已更新 →
            </a>
          </span>
          <a
            href="https://github.com/WilsonWukz"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.68rem",
              color: "#6B6966",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1C1C1C")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B6966")}
          >
            <GithubIcon size={12} />
            WilsonWukz
          </a>
        </div>
      </div>

      {/* ── 主内容 ── */}
      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "3.5rem 1.5rem 5rem",
        }}
      >
        {/* ── Hero ── */}
        <header
          className="fade-in fade-in-delay-1"
          style={{ marginBottom: "0" }}
        >
          <h1
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "#1C1C1C",
              marginBottom: "1.25rem",
              lineHeight: 1.25,
            }}
          >
            wilson wu
          </h1>
          <p
            style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: "0.875rem",
              color: "#3A3A39",
              lineHeight: 1.85,
              maxWidth: "500px",
              marginBottom: "1.4rem",
            }}
          >
            我在不停地探索，多智能体架构如何带来不同的，奇妙的 AI 产品体验。这里会更新我的提示词实验、Agent 工作流以及正在孵化的 AI 项目。坐标悉尼，茫茫人海，感谢遇见。
          </p>
          {/* 社交链接 */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <a
              href="https://github.com/WilsonWukz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "0.75rem",
                color: "#3A3A39",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                transition: "color 150ms",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2A1810")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3A3A39")}
            >
              <GithubIcon size={13} />
              github.com/WilsonWukz
            </a>
          </div>
        </header>

        {/* ── 粒子装饰（Hero 下方）── */}
        <div className="fade-in fade-in-delay-2">
          <ParticlesCanvas />
        </div>

        {/* ── 引言 ── */}
        <figure
          className="fade-in fade-in-delay-3"
          style={{ margin: "0 0 3.5rem 0" }}
        >
          <blockquote
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.72rem",
              fontStyle: "italic",
              color: "#6B6966",
              textAlign: "center",
              lineHeight: 1.75,
              margin: 0,
              padding: 0,
              border: "none",
            }}
          >
            "The only thing stopping you from achieving your dreams is your comfort zone."
          </blockquote>
        </figure>

        {/* ── 01 Skills ── */}
        <section
          className="fade-in fade-in-delay-3"
          style={{ marginBottom: "3.5rem" }}
        >
          <SectionHeader label="01  Skills" />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {skills.map((skill) => (
              <div key={skill.slug}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.3rem" }}>
                  <ContentLink href={skill.github}>{skill.name}</ContentLink>
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: "0.6rem",
                      color: "#B6B2AC",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      border: "1px solid #D4C9B8",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "2px",
                    }}
                  >
                    {skill.tag}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: "0.8rem",
                    color: "#6B6966",
                    lineHeight: 1.7,
                    marginTop: "0.25rem",
                  }}
                >
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
          {/* 查看全部 */}
          <div style={{ marginTop: "1.5rem" }}>
            <ContentLink href="https://github.com/WilsonWukz/MySkills">
              查看所有 Skills →
            </ContentLink>
          </div>
        </section>

        {/* ── 02 Writings ── */}
        <section
          className="fade-in fade-in-delay-4"
          style={{ marginBottom: "3.5rem" }}
        >
          <SectionHeader label="02  Writings" />
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.75rem",
              color: "#B6B2AC",
              fontStyle: "italic",
            }}
          >
            — 正在写，快了。
          </p>
        </section>

        {/* ── 03 What Shapes Me ── */}
        <section
          className="fade-in fade-in-delay-4"
          style={{ marginBottom: "3.5rem" }}
        >
          <SectionHeader label="03  What Shapes Me" />
          <p
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.75rem",
              color: "#B6B2AC",
              fontStyle: "italic",
            }}
          >
            — 整理中，稍后更新。
          </p>
        </section>

        {/* ── Contact ── */}
        <section className="fade-in fade-in-delay-5">
          <SectionHeader label="Contact" />
          <p
            style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: "0.875rem",
              color: "#3A3A39",
              lineHeight: 1.85,
              marginBottom: "1rem",
              maxWidth: "480px",
            }}
          >
            如果你想聊聊 AI、多智能体、或者任何有趣的想法，欢迎写信给我。我会认真读，通常也会回复 :)
          </p>
          <ContentLink href="https://github.com/WilsonWukz">
            github.com/WilsonWukz
          </ContentLink>
        </section>
      </main>

      {/* ── 页脚 ── */}
      <footer
        style={{
          borderTop: "1px solid #D4C9B8",
          padding: "1.5rem 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "0.62rem",
            color: "#B6B2AC",
            letterSpacing: "0.1em",
          }}
        >
          wilson wu · sydney · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
