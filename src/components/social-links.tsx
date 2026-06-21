import { Github, Linkedin } from "lucide-react";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { siteConfig } from "#/lib/site-config";
import * as m from "#/paraglide/messages";

type SocialLinksProps = {
  className?: string;
};

export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={m.social_github_label()}
          />
        }
      >
        <Github className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={m.social_linkedin_label()}
          />
        }
      >
        <Linkedin className="size-4" />
      </Button>
    </div>
  );
}
