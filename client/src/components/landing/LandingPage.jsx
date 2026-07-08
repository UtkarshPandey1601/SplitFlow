import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Equal, percentage, or manual',
    description: 'Choose the split that fits the expense and keep the math transparent.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h14" />
        <path d="M7 12h10" />
        <path d="M9 17h6" />
      </svg>
    )
  },
  {
    title: 'Clear settlement paths',
    description: 'Turn shared debt into a simple sequence of transfers and balances.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16" />
        <path d="M7 12h10" />
        <path d="M10 17h4" />
      </svg>
    )
  },
  {
    title: 'Live expense tracking',
    description: 'See each contribution arrive as soon as it is added to the group.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V8" />
        <path d="M10 19V5" />
        <path d="M16 19v-6" />
      </svg>
    )
  },
  {
    title: 'Safe shared access',
    description: 'Invite people into a workspace with secure sign-in and private group data.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M8 8V7a4 4 0 0 1 8 0v1" />
      </svg>
    )
  }
];

const steps = ['Create Group', 'Add Expenses', 'Smart Settlements', 'Done'];

function AnimatedCounter({ end, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end]);

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-3 text-lg text-slate-600">{description}</p>
    </div>
  );
}

function BrowserFrame({ title, children }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <div className="ml-3 flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-medium text-slate-500">
          {title}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    document.title = 'SplitFlow — Shared finance for modern groups';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'SplitFlow helps roommates, students, and teams track shared expenses, simplify debt, and settle up with clarity.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%)]" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-sm font-semibold text-emerald-600">
              SF
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-slate-700">SPLITFLOW</p>
              <p className="text-xs text-slate-500">Shared finance, calm by design</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
              Sign in
            </Link>
            <Link to="/register" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
              Get Started
            </Link>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 pb-16 sm:px-8 lg:px-10 lg:pb-20">
          <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                New • Clearer shared spending for groups and teams
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                A cleaner way to manage shared money.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                SplitFlow helps roommates, hostel circles, and small teams track shared expenses in rupees with less effort and more clarity.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                  Get Started
                </Link>
                <a href="https://github.com" className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900">
                  GitHub
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <BrowserFrame title="SplitFlow • Overview">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Shared balance</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600">+12.8%</span>
                    </div>
                    <div className="mt-4 flex items-end gap-3">
                      <div className="text-3xl font-semibold text-slate-900">₹1,842</div>
                      <div className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">Settled</div>
                    </div>
                    <div className="mt-6 flex items-end gap-2">
                      {[44, 64, 56, 78, 92].map((height) => (
                        <div key={height} className="flex-1 rounded-t-xl bg-slate-900" style={{ height: `${height}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Upcoming transfer</span>
                      <span className="text-slate-900">₹146</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {['Aarav → Meera', 'Kavya ↺ Rohan', 'Nisha → Dev'].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                          <span className="text-slate-600">{item}</span>
                          <span className="text-slate-900">₹32</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </BrowserFrame>
            </motion.div>
          </section>

          <section className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
            {[
              { label: 'Groups', value: 1240, suffix: '+' },
              { label: 'Expenses', value: 8600, suffix: '+' },
              { label: 'Money Settled', value: 182000, prefix: '₹', suffix: '+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="text-3xl font-semibold text-slate-900">
                  <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </section>
        </main>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <SectionHeading
          eyebrow="Core features"
          title="Built around the moments that usually create friction."
          description="Each part of the experience is focused on helping people settle up faster and with less noise."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <SectionHeading
            eyebrow="How it works"
            title="From first invite to final settlement."
            description="A short path that keeps the process calm from start to finish."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-sm font-medium text-emerald-600">0{index + 1}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <SectionHeading
              eyebrow="Analytics"
              title="See the pattern behind the spend."
              description="A compact view of where money goes and which balances need attention."
            />
            <div className="mt-8 space-y-4">
              {[
                { label: 'Housing', value: '41%' },
                { label: 'Food', value: '28%' },
                { label: 'Travel', value: '19%' },
                { label: 'Misc', value: '12%' }
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: item.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-400">Live snapshot</p>
            <h3 className="mt-3 text-3xl font-semibold">A sharper read on the month ahead.</h3>
            <p className="mt-4 max-w-xl text-slate-300">
              Spot the recurring costs, understand which balances need attention, and keep the group moving without extra effort.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Largest balance', value: '₹326 owed to Meera' },
                { title: 'Settled ratio', value: '94% this month' },
                { title: 'Most active category', value: 'Food & groceries' },
                { title: 'Next transfer', value: 'Friday • 2:30 PM' }
              ].map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-sm text-slate-300">{card.title}</div>
                  <div className="mt-2 font-semibold text-white">{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">SplitFlow</p>
            <p className="text-sm text-slate-600">Shared finance, designed to stay clear and calm.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a href="https://github.com" className="transition hover:text-slate-900">GitHub</a>
            <a href="#" className="transition hover:text-slate-900">Documentation</a>
            <a href="#" className="transition hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
