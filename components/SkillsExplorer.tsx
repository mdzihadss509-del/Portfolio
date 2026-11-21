"use client";

import { useMemo, useState } from "react";
import { Search, Layers3, ChevronDown, Check, ArrowUpRight } from "lucide-react";
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
  const [disciplinePanelOpen, setDisciplinePanelOpen] = useState(false);

  const visibleSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const inGroup = active === "All" || categoryName(skill) === active;
      const searchable = [skill.name, skill.group_name, skill.description].filter(Boolean).join(" ").toLowerCase();
      return inGroup && (!normalized || searchable.includes(normalized));
    });
  }, [active, query, skills]);

  const shownSkills = expanded || query ? visibleSkills : visibleSkills.slice(0, 8);
  const activeCount = active === "All" ? skills.length : groups.find((group) => group.name === active)?.items.length || 0;

  function chooseDiscipline(name: string) {
    setActive(name);
    setExpanded(false);
    setDisciplinePanelOpen(false);
  }

  return (
    <div className="skills-explorer">
      <div className="skills-explorer-top">
        <div className="skills-explorer-intro">
          <span className="skills-eyebrow"><Layers3 size={14} /> CAPABILITIES / TOOLKIT</span>
          <p>Explore the disciplines, technologies and creative tools I work with.</p>
        </div>
        <div className="skills-explorer-controls">
          <div className="skills-category-select">
            <span>EXPLORE BY DISCIPLINE</span>
            <div className="skills-discipline-picker">
              <button
                type="button"
                className={`skills-discipline-trigger${disciplinePanelOpen ? " is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={disciplinePanelOpen}
                onClick={() => setDisciplinePanelOpen((open) => !open)}
              >
                <span className="skills-discipline-trigger-copy">
                  <span className="skills-discipline-trigger-name">{active === "All" ? "All disciplines" : active}</span>
                  <span className="skills-discipline-trigger-meta">{activeCount} {activeCount === 1 ? "skill" : "skills"} available</span>
                </span>
                <ChevronDown size={17} aria-hidden="true" />
              </button>
              {disciplinePanelOpen && (
                <div className="skills-discipline-panel" role="listbox" aria-label="Choose a discipline">
                  <div className="skills-discipline-panel-head">
                    <span>SELECT A DISCIPLINE</span>
                    <span>{groups.length} CATEGORIES</span>
                  </div>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active === "All"}
                    className={`skills-discipline-option skills-discipline-all${active === "All" ? " is-selected" : ""}`}
                    onClick={() => chooseDiscipline("All")}
                  >
                    <span className="skills-discipline-option-icon"><Layers3 size={17} /></span>
                    <span className="skills-discipline-option-copy"><strong>All disciplines</strong><small>Explore the complete toolkit</small></span>
                    <span className="skills-discipline-option-count">{skills.length}</span>
                    {active === "All" ? <Check size={16} className="skills-discipline-check" /> : <ArrowUpRight size={15} className="skills-discipline-arrow" />}
                  </button>
                  <div className="skills-discipline-list">
                    {groups.map((group, index) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={active === group.name}
                        className={`skills-discipline-option${active === group.name ? " is-selected" : ""}`}
                        key={group.name}
                        onClick={() => chooseDiscipline(group.name)}
                      >
                        <span className="skills-discipline-option-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="skills-discipline-option-copy"><strong>{group.name}</strong><small>{group.items.length} {group.items.length === 1 ? "skill" : "skills"} in this discipline</small></span>
                        <span className="skills-discipline-option-count">{group.items.length}</span>
                        {active === group.name ? <Check size={16} className="skills-discipline-check" /> : <ArrowUpRight size={15} className="skills-discipline-arrow" />}
                      </button>
                    ))}
                  </div>
                  <div className="skills-discipline-panel-foot">CHOOSE A CATEGORY TO VIEW ITS SKILLS</div>
                </div>
              )}
            </div>
          </div>
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
