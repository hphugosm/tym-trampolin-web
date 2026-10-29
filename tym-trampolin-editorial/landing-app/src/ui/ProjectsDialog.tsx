import { locale, t } from "./locale";
import { useEffect, useId, useRef, useState } from "react";
import { projects } from "./content";
import type { Project } from "./content";
import { projectArtwork } from "../../../project-art.mjs";
import "../../../project-art.css";

interface ProjectsDialogProps {
  open: boolean;
  onClose: () => void;
}

/** The catalog and its detail share one native modal and its focus trap. */
export function ProjectsDialog({ open, onClose }: ProjectsDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const [selected, setSelected] = useState<Project | null>(null);
  const projectButtons = useRef(new Map<string, HTMLButtonElement>());
  const lastProjectId = useRef<string | null>(null);
  const restoreProjectFocus = useRef(false);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    if (open && !modal.open) modal.showModal();
    if (!open) {
      if (modal.open) modal.close();
      setSelected(null);
      restoreProjectFocus.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (selected) title.current?.focus();
    else if (restoreProjectFocus.current) {
      if (lastProjectId.current)
        projectButtons.current.get(lastProjectId.current)?.focus();
      restoreProjectFocus.current = false;
    }
  }, [selected, open]);

  return (
    <dialog
      ref={dialog}
      className="project-dialog project-catalog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <button
        type="button"
        className="dialog-close"
        aria-label={t("Zavřít projekty", "Close projects")}
        onClick={() => dialog.current?.close()}
      >{t("Zavřít ×", "Close \u00d7")}</button>
      {selected && (
        <button
          type="button"
          className="catalog-back"
          onClick={() => {
            restoreProjectFocus.current = true;
            setSelected(null);
          }}
        >{t("Zpět na projekty", "Back to projects")}</button>
      )}
      <h2 id={titleId} ref={title} tabIndex={-1}>
        {selected ? selected.name : t("Naše projekty", "Our projects")}
      </h2>
      {selected ? (
        <>
          <div
            className="catalog-selected-art"
            dangerouslySetInnerHTML={{ __html: projectArtwork(selected.id, locale) }}
          />
          <p className="catalog-meta">
            {selected.category} / {selected.status}
          </p>
          <p>{selected.detail}</p>
          <div className="project-detail-links">
            {(
              selected.links ??
              (selected.url
                ? [{ label: t("Otevřít projekt", "Open project"), url: selected.url }]
                : [])
            ).map((link) => (
              <a
                key={link.url}
                className="primary-link"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </>
      ) : (
        <div className="catalog-list">
          {projects.map((project, index) => (
            <article
              className="catalog-entry"
              key={project.id}
              style={{ animationDelay: `${100 + index * 45}ms` }}
            >
              <div
                className="catalog-art"
                dangerouslySetInnerHTML={{ __html: projectArtwork(project.id, locale) }}
              />
              <p className="catalog-meta">
                {project.category} / {project.status}
              </p>
              <h3>
                <button
                  type="button"
                  className="catalog-open"
                  aria-label={project.name}
                  ref={(button) => {
                    if (button) projectButtons.current.set(project.id, button);
                    else projectButtons.current.delete(project.id);
                  }}
                  onClick={() => {
                    lastProjectId.current = project.id;
                    setSelected(project);
                  }}
                >
                  {project.name}
                  <span aria-hidden="true">↗</span>
                </button>
              </h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      )}
    </dialog>
  );
}
