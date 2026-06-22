import { HoochIntro } from "@/components/HoochIntro";
import { SeoContent } from "@/components/SeoContent";

export function LearnMore() {
  return (
    <details className="learn-more">
      <summary className="learn-more-toggle">
        <span className="station-name">Learn more</span>
        <span className="learn-more-icon" aria-hidden="true" />
      </summary>
      <div className="learn-more-panel">
        <HoochIntro />
        <SeoContent />
      </div>
    </details>
  );
}
