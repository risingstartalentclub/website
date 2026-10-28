"use client";

import { useEffect } from "react";

function showR(root: ParentNode) {
  root.querySelectorAll("[data-next-mark]").forEach((mark) => {
    if (!(mark instanceof HTMLElement) || mark.querySelector("[data-rising-mark]")) return;
    const svg = mark.querySelector("svg");
    if (!svg) return;
    const letter = document.createElement("span");
    letter.dataset.risingMark = "R";
    letter.textContent = "R";
    letter.style.fontWeight = "800";
    letter.style.fontSize = "15px";
    letter.style.lineHeight = "1";
    svg.replaceWith(letter);
  });
}

export function DevMark() {
  useEffect(() => {
    const paint = () => {
      showR(document);
      document.querySelectorAll("nextjs-portal").forEach((portal) => {
        if (portal.shadowRoot) showR(portal.shadowRoot);
      });
    };

    const watched = new WeakSet<Node>();
    const watch = (node: Node) => {
      if (watched.has(node)) return;
      watched.add(node);
      observer.observe(node, { childList: true, subtree: true });
    };
    const observer = new MutationObserver(() => {
      document.querySelectorAll("nextjs-portal").forEach((portal) => {
        if (portal.shadowRoot) watch(portal.shadowRoot);
      });
      paint();
    });
    watch(document.documentElement);
    document.querySelectorAll("nextjs-portal").forEach((portal) => {
      if (portal.shadowRoot) watch(portal.shadowRoot);
    });
    paint();

    return () => observer.disconnect();
  }, []);

  return null;
}
