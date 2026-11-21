"use client";

import { useMemo, useState } from "react";
import { Search, Layers3, ChevronDown } from "lucide-react";
import ContentIcon from "@/components/ContentIcon";

type Skill = {
  id?: string;
  name?: string;
  group_name?: string | null;
  description?: string | null;
  icon_name?: string | null;
  icon_url?: string | null;
};

function categoryName(skill: Skill) {
  const raw = String(skill.group_name || "Other").trim();
  return raw || "Other";
}

export default function SkillsExplorer({ skills }: { skills: Skill[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    skills.forEach((skill) => {
      const group = categoryName(skill);
      map.set(group, [...(map.get(group) || []), skill]);
    });
    return [...map.entries()]
      .map(([name, items]) => ({ name, items }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [skills]);

  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const inGroup = active === "All" || categoryName(skill) === active;
      const searchable = [skill.name, skill.group_name, skill.description].filter(Boolean).join(" ").toLowerCase();
      return inGroup && (!normalized || searchable.includes(normalized));
    });
  }, [active, query, skills]);

  const shownSkills = expanded || query ? visibleSkills : visibleSkills.slice(0, 8);

  return (
    <div className="skills-explorer">
      <div className="skills-explorer-top">
        <div className="skills-explorer-intro">
          <span className="skills-eyebrow"><Layers3 size={14} /> CAPABILITIES / TOOLKIT</span>
          <p>Explore the disciplines, technologies and creative tools I work with.</p>
        </div>
        <div className="skills-explorer-controls">
          <label className="skills-category-select">
            <span>FILTER BY DISCIPLINE</span>
            <div className="skills-category-select-control">
              <select
                aria-label="Filter skills by discipline"
                value={active}
                onChange={(event) => { setActive(event.target.value); setExpanded(false); }}
              >
                <option value="All">All disciplines ({skills.length})</option>
                {groups.map((group) => (
                  <option key={group.name} value={group.name}>{group.name} ({group.items.length})</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </label>
          <label className="skills-search">
            <Search size={16} aria-hidden="true" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setExpanded(false); }} placeholder="Search skills..." aria-label="Search skills" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </label>
        </div>
      </div>

      <div className="skills-results-head">
        <div>
          <span className="skills-results-kicker">SELECTED TOOLKIT</span>
          <h3>{query ? "Search results" : active === "All" ? "All skills" : active}</h3>
        </div>
        <span className="skills-results-total">{visibleSkills.length} {visibleSkills.length === 1 ? "SKILL" : "SKILLS"}</span>
      </div>

      {shownSkills.length > 0 ? (
        <div className="skills-card-grid">
          {shownSkills.map((skill, index) => (
            <article className="skill-card" key={skill.id || skill.name || index}>
              <div className="skill-card-top">
                <span className="skill-card-index">{String(index + 1).padStart(2, "0")}</span>
                {skill.icon_url || skill.icon_name ? <ContentIcon name={skill.icon_name || "Wrench"} imageUrl={skill.icon_url} className="skill-card-icon" size={20} /> : <span className="skill-card-icon-fallback"><Layers3 size={19} /></span>}
              </div>
              <h4>{skill.name}</h4>
              <p>{skill.description || categoryName(skill)}</p>
              <span className="skill-card-accent" />
            </article>
          ))}
        </div>
      ) : (
        <p className="skills-empty">No matching skills found. Try another search.</p>
      )}

      {!query && visibleSkills.length > 8 && (
        <button className="skills-show-more" type="button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show less" : `Show all ${visibleSkills.length} skills`}
          <ChevronDown size={16} className={expanded ? "is-rotated" : ""} />
        </button>
      )}
      <p className="skills-live-note">THE TOOLKIT EVOLVES WITH EVERY PROJECT <span>↗</span></p>
    </div>
  );
}
