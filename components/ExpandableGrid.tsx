"use client";

import { Children, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type ExpandableGridProps = {
  children: ReactNode;
  className: string;
  initialCount: number;
  itemLabel: string;
};

export default function ExpandableGrid({
  children,
  className,
  initialCount,
  itemLabel,
}: ExpandableGridProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const items = Children.toArray(children);
  const limit = Math.max(1, initialCount);
  const visibleItems = expanded ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <>
      <div id={contentId} className={className} data-expandable-grid data-expanded={expanded}>
        {visibleItems}
      </div>
      {hasMore && (
        <div className="collection-grid-controls">
          <button
            className="collection-grid-toggle"
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Show less" : `View all ${items.length} ${itemLabel}`}
            <ChevronDown size={16} className={expanded ? "is-rotated" : ""} aria-hidden="true" />
          </button>
          <span className="collection-grid-count" aria-live="polite">
            {expanded ? `Showing all ${items.length}` : `Showing ${visibleItems.length} of ${items.length}`}
          </span>
        </div>
      )}
    </>
  );
}
