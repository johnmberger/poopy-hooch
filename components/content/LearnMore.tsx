import { HoochIntro } from "@/components/content/HoochIntro";
import { SeoContent } from "@/components/content/SeoContent";

export function LearnMore() {
  return (
    <details className="learn-more">
      <summary className="learn-more-toggle">
        <span className="station-list-link-text">
          <span className="station-name">Learn more</span>
          <span className="station-section">EPA limits, USGS data, and tubing safety</span>
        </span>
        <span className="learn-more-icon" aria-hidden="true" />
      </summary>
      <div className="learn-more-panel">
        <HoochIntro />
        <SeoContent />
      </div>
    </details>
  );
}
