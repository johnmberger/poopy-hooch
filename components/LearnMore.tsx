import { HoochIntro } from "@/components/HoochIntro";
import { SeoContent } from "@/components/SeoContent";

export function LearnMore() {
  return (
    <details className="learn-more">
      <summary className="learn-more-toggle">Learn more</summary>
      <div className="learn-more-panel">
        <HoochIntro />
        <SeoContent />
      </div>
    </details>
  );
}
