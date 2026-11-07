import { Link } from "wouter";

const features = [
  {
    number: "01",
    icon: "◈",
    title: "Expressive 3D Characters",
    description:
      "Bring stylized characters to life with facial expressions, natural movement, and personality.",
  },
  {
    number: "02",
    icon: "✳",
    title: "Intelligent Acting",
    description:
      "Create dialogue-driven performances with emotional reactions, gestures, and character interaction.",
  },
  {
    number: "03",
    icon: "◉",
    title: "Cinematic Camera",
    description:
      "Build scenes with automatic camera direction, close-ups, reaction shots, and cinematic framing.",
  },
  {
    number: "04",
    icon: "♫",
    title: "Synchronized Dialogue",
    description:
      "Give characters voices and coordinate dialogue playback with animated performances.",
  },
  {
    number: "05",
    icon: "▧",
    title: "Creative Environments",
    description:
      "Place your characters in different environments and build scenes around your stories.",
  },
  {
    number: "06",
    icon: "▶",
    title: "Video Creation",
    description:
      "Preview your scenes and create video recordings directly from your character studio.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your characters",
    description:
      "Select the characters you want to bring into your story.",
  },
  {
    number: "02",
    title: "Create your scene",
    description:
      "Write dialogue, select an environment, and define the performance.",
  },
  {
    number: "03",
    title: "Direct and create",
    description:
      "Preview the animation, adjust your scene, and record your creation.",
  },
];

export default function Home() {
  return (
    <main className="landing-page">
      <div className="landing-background">
        <div className="ambient-glow ambient-glow-one" />
        <div className="ambient-glow ambient-glow-two" />
        <div className="hero-grid" />
      </div>

      <header className="landing-header">
        <Link href="/" className="brand">
          <span className="brand-symbol">C</span>

          <span className="brand-name">
            CHARACTER<span>AI</span>
          </span>
        </Link>

        <nav className="desktop-navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="header-actions">
          <Link href="/studio" className="header-studio-link">
            Open Studio <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="announcement-pill">
            <span className="announcement-dot" />
            YOUR CREATIVE WORLD STARTS HERE
          </div>

          <h1>
            Create characters.
            <br />
            <span>Tell extraordinary</span>
            <br />
            stories.
          </h1>

          <p className="hero-description">
            A creative 3D character studio for building expressive
            performances, cinematic comedy scenes, and animated stories.
          </p>

          <div className="hero-actions">
            <Link href="/studio" className="primary-button">
              Enter Creative Studio
              <span>↗</span>
            </Link>

            <a href="#features" className="secondary-button">
              Explore Features
              <span>↓</span>
            </a>
          </div>

          <div className="hero-caption">
            <span className="caption-line" />
            CREATE WITHOUT LIMITS
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="visual-card visual-card-main">
            <div className="visual-card-top">
              <span className="visual-live-dot" />
              CHARACTER STUDIO
              <span className="visual-card-menu">•••</span>
            </div>

            <div className="visual-stage">
              <div className="stage-light stage-light-one" />
              <div className="stage-light stage-light-two" />

              <div className="character-placeholder">
                <div className="character-aura" />

                <div className="character-head">
                  <div className="character-ear ear-left" />
                  <div className="character-ear ear-right" />

                  <div className="character-face">
                    <div className="character-eye eye-left" />
                    <div className="character-eye eye-right" />
                    <div className="character-smile" />
                  </div>
                </div>

                <div className="character-body" />
              </div>

              <div className="stage-floor" />

              <div className="stage-label">
                <span>●</span> LIVE PREVIEW
              </div>
            </div>

            <div className="visual-card-bottom">
              <div>
                <strong>Character Performance</strong>
                <span>Expressive animation preview</span>
              </div>

              <span className="play-button">▶</span>
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-icon">✳</span>
            <div>
              <strong>Emotional Acting</strong>
              <span>Expressions & gestures</span>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-icon">◉</span>
            <div>
              <strong>Cinematic Camera</strong>
              <span>Intelligent shot direction</span>
            </div>
          </div>

          <div className="visual-decoration decoration-one" />
          <div className="visual-decoration decoration-two" />
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <span className="trust-icon">✦</span>
          <span>CREATE</span>
        </div>

        <div>
          <span className="trust-icon">◈</span>
          <span>ANIMATE</span>
        </div>

        <div>
          <span className="trust-icon">◉</span>
          <span>DIRECT</span>
        </div>

        <div>
          <span className="trust-icon">▶</span>
          <span>RECORD</span>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <div className="section-eyebrow">
            <span /> THE CREATIVE TOOLKIT
          </div>

          <h2>
            Everything you need
            <br />
            to bring stories <span>to life.</span>
          </h2>

          <p>
            Build your scenes with an integrated collection of
            character, animation, dialogue, and camera tools.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-card-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">{feature.number}</span>
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="how-it-works">
        <div className="workflow-heading">
          <div className="section-eyebrow">
            <span /> YOUR CREATIVE PROCESS
          </div>

          <h2>
            From imagination
            <br />
            <span>to animation.</span>
          </h2>
        </div>

        <div className="workflow-grid">
          {steps.map((step) => (
            <article className="workflow-card" key={step.number}>
              <span className="workflow-number">{step.number}</span>

              <div className="workflow-line" />

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-content">
          <div className="section-eyebrow">
            <span /> CHARACTERAI STUDIO
          </div>

          <h2>
            Your ideas.
            <br />
            Your characters.
            <br />
            <span>Your stories.</span>
          </h2>

          <p>
            CharacterAI Studio brings character performance,
            dialogue, animation, and cinematic direction
            together in one creative workspace.
          </p>

          <Link href="/studio" className="primary-button">
            Start Creating <span>↗</span>
          </Link>
        </div>

        <div className="about-decoration">
          <div className="about-circle circle-one" />
          <div className="about-circle circle-two" />
          <div className="about-center">C</div>
        </div>
      </section>

      <footer className="landing-footer">
        <Link href="/" className="brand footer-brand">
          <span className="brand-symbol">C</span>

          <span className="brand-name">
            CHARACTER<span>AI</span>
          </span>
        </Link>

        <p>Made for creators. Built for imagination.</p>

        <Link href="/studio" className="footer-link">
          Open Studio ↗
        </Link>

        <span className="footer-copyright">
          © {new Date().getFullYear()} CharacterAI Studio
        </span>
      </footer>
    </main>
  );
}
