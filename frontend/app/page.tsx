import Link from "next/link";

const features = [
  {
    title: "Code together",
    description:
      "Edit the same project with your team in real time, without passing files around.",
  },
  {
    title: "Built for developers",
    description:
      "A familiar browser-based development environment with projects, files, folders, and a powerful code editor.",
  },
  {
    title: "Your project, connected",
    description:
      "Bring collaboration, project context, and development tools together in one workspace.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            MeshIDE
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400">
              Collaborative development for the web
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Code together.
              <br />
              <span className="text-zinc-500">Build together.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              MeshIDE is a browser-based collaborative development
              environment where teams can build, edit, and work on the same
              project together.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 sm:w-auto"
              >
                Get started
              </Link>

              <Link
                href="/login"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 sm:w-auto"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* IDE Preview */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40">
              {/* Window header */}
              <div className="flex h-11 items-center border-b border-zinc-800 bg-zinc-900 px-4">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>

                <div className="mx-auto text-xs text-zinc-500">
                  MeshIDE · Forge Demo
                </div>

                <div className="w-12" />
              </div>

              {/* IDE */}
              <div className="flex min-h-[360px]">
                {/* Explorer */}
                <div className="hidden w-52 border-r border-zinc-800 bg-zinc-950/60 p-4 sm:block">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Explorer
                  </p>

                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="text-zinc-200">▾ Forge Demo</div>
                    <div className="pl-4">▾ src</div>
                    <div className="pl-8">▾ components</div>
                    <div className="pl-12 text-zinc-300">Button.tsx</div>
                    <div className="pl-12 text-zinc-300">Card.tsx</div>
                    <div className="pl-8">app.tsx</div>
                    <div className="pl-4 text-zinc-300">package.json</div>
                    <div className="pl-4 text-zinc-300">README.md</div>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex h-10 items-center border-b border-zinc-800 bg-zinc-950/40 px-4">
                    <span className="border-r border-zinc-800 px-4 text-xs text-zinc-300">
                      app.tsx
                    </span>
                  </div>

                  <div className="p-5 font-mono text-xs leading-6 sm:text-sm">
                    <div className="flex">
                      <span className="mr-6 w-5 select-none text-right text-zinc-700">
                        1
                      </span>
                      <span>
                        <span className="text-zinc-500">import</span>{" "}
                        <span className="text-zinc-300">React</span>{" "}
                        <span className="text-zinc-500">from</span>{" "}
                        <span className="text-zinc-400">&quot;react&quot;</span>
                      </span>
                    </div>

                    <div className="flex">
                      <span className="mr-6 w-5 select-none text-right text-zinc-700">
                        2
                      </span>
                      <span />
                    </div>

                    <div className="flex">
                      <span className="mr-6 w-5 select-none text-right text-zinc-700">
                        3
                      </span>
                      <span>
                        <span className="text-zinc-500">export default</span>{" "}
                        <span className="text-zinc-300">function</span>{" "}
                        <span className="text-zinc-200">App</span>
                        <span className="text-zinc-500">()</span>{" "}
                        <span className="text-zinc-500">{"{"}</span>
                      </span>
                    </div>

                    <div className="flex">
                      <span className="mr-6 w-5 select-none text-right text-zinc-700">
                        4
                      </span>
                      <span className="pl-5">
                        <span className="text-zinc-500">return</span>{" "}
                        <span className="text-zinc-300">&lt;Workspace /&gt;</span>
                      </span>
                    </div>

                    <div className="flex">
                      <span className="mr-6 w-5 select-none text-right text-zinc-700">
                        5
                      </span>
                      <span>
                        <span className="text-zinc-500">{"}"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex h-7 items-center justify-between border-t border-zinc-800 bg-zinc-950 px-3 text-[10px] text-zinc-500">
                <span>Ready</span>
                <span>TypeScript · UTF-8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <h2 className="text-lg font-semibold text-white">
                  {feature.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-900">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your workspace. Your team. One IDE.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            Start building with MeshIDE and bring collaborative development
            directly into the browser.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-zinc-600 lg:px-8">
          <span>© {new Date().getFullYear()} MeshIDE</span>
          <span>Code together. Build together.</span>
        </div>
      </footer>
    </main>
  );
}