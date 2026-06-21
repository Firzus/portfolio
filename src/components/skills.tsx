import { Badge } from "#/components/ui/badge";
import { skillGroups } from "#/lib/skills";
import * as m from "#/paraglide/messages";

export function Skills() {
  return (
    <section id="skills" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          {m.skills_eyebrow()}
        </p>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {m.skills_title()}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">{m.skills_subtitle()}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.labelKey} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">
              {m[group.labelKey]()}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item}>
                  <Badge variant="muted">{item}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
