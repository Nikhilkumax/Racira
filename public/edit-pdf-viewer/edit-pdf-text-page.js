// public/edit-pdf-viewer/ui-stub.js
function showAlert(title, message, _type, onClose) {
  const modal = document.getElementById("alert-modal");
  const titleEl = document.getElementById("alert-title");
  const msgEl = document.getElementById("alert-message");
  if (modal && titleEl && msgEl) {
    titleEl.textContent = title || "Alert";
    msgEl.textContent = message || "";
    modal.classList.remove("hidden");
    const ok = document.getElementById("alert-ok");
    const dismiss = () => {
      modal.classList.add("hidden");
      ok?.removeEventListener("click", dismiss);
      modal.removeEventListener("click", dismiss);
      if (onClose) onClose();
    };
    ok?.addEventListener("click", dismiss);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) dismiss();
    });
  }
}
var loaderCount = 0;
function showLoader(text) {
  loaderCount++;
  const modal = document.getElementById("loader-modal");
  const txt = document.getElementById("loader-text");
  if (modal) modal.classList.remove("hidden");
  if (txt && text) txt.textContent = text;
}
function hideLoader() {
  loaderCount = Math.max(0, loaderCount - 1);
  if (loaderCount === 0) {
    const modal = document.getElementById("loader-modal");
    if (modal) modal.classList.add("hidden");
  }
}
function t(key, params) {
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(`{{${k}}}`, String(v));
    }
    return result;
  }
  return key;
}
async function batchDecryptIfNeeded(files) {
  return [...files];
}

// public/edit-pdf-viewer/edit-pdf-text-dock.ts
var TEXT_SECTIONS = [
  { id: "font", title: "Font", icon: "ph-text-aa" },
  { id: "size", title: "Font Size", icon: "ph-text-t" },
  { id: "color", title: "Text Color", icon: "ph-palette" },
  { id: "align", title: "Alignment", icon: "ph-text-align-left" },
  { id: "spacing", title: "Spacing", icon: "ph-arrows-out-line-vertical" },
  { id: "lists", title: "Lists", icon: "ph-list-bullets" },
  { id: "more", title: "More", icon: "ph-dots-three" }
];
var SCOPE_SECTION = {
  id: "scope",
  title: "Edit Scope",
  icon: "ph-pencil-simple"
};
var STROKE_SECTION = {
  id: "stroke",
  title: "Path Stroke",
  icon: "ph-path"
};
var MULTI_SECTION = {
  id: "alignMulti",
  title: "Align Objects",
  icon: "ph-align-left"
};
var OBJ_BTN_IDS = [
  "rotL",
  "rotR",
  "flipH",
  "flipV",
  "replImg",
  "extEdit",
  "altText",
  "front",
  "back",
  "dupe"
];
var SLIDER_FIELDS = [
  ["fLine", "Line"],
  ["fPara", "Paragraph"],
  ["fChar", "Character"],
  ["fWordSp", "Word"]
];
var MORE_FIELDS = [
  ["fHScale", "H-Scale %"],
  ["fFirstInd", "First Indent"],
  ["fHangInd", "Hanging Indent"]
];
var q = (id) => document.getElementById(id);
var ph = (name) => {
  const i = document.createElement("i");
  i.className = `ph ${name}`;
  return i;
};
var div = (cls) => {
  const d = document.createElement("div");
  d.className = cls;
  return d;
};
var mkBtn = (cls, label) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.title = label;
  b.setAttribute("aria-label", label);
  b.addEventListener("mousedown", (e) => e.preventDefault());
  return b;
};
var rowOf = (el) => {
  const r = el?.closest(".row");
  return r instanceof HTMLElement ? r : null;
};
var stepperOf = (el) => {
  const s = el?.closest(".stepper");
  return s instanceof HTMLElement ? s : null;
};
var numInput = (id) => {
  const el = q(id);
  return el instanceof HTMLInputElement ? el : null;
};
function setupPagePill() {
  const save = q("save");
  const pageLabel = q("pageLabel");
  const app = q("text-editor-app");
  if (!save || !pageLabel || !app || !save.parentElement) return;
  const pill = mkBtn("dpagepill", "Go to page");
  pill.textContent = "\u2013 / \u2013";
  save.parentElement.insertBefore(pill, save);
  const syncPill = () => {
    pill.textContent = pageLabel.textContent ?? "";
  };
  new MutationObserver(syncPill).observe(pageLabel, {
    childList: true,
    characterData: true,
    subtree: true
  });
  syncPill();
  const parse = () => {
    const parts = (pageLabel.textContent ?? "").split("/");
    return {
      current: parseInt(parts[0] ?? "", 10),
      total: parseInt(parts[1] ?? "", 10)
    };
  };
  let menu = null;
  const closeMenu = () => {
    menu?.remove();
    menu = null;
  };
  pill.addEventListener("click", () => {
    if (menu) {
      closeMenu();
      return;
    }
    menu = div("ecmenu dpagemenu");
    const rect = pill.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.right = "8px";
    menu.addEventListener("click", (e) => e.stopPropagation());
    const nav = div("dpagenav");
    const prevB = mkBtn("dnavbtn", "Previous page");
    prevB.appendChild(ph("ph-caret-left"));
    prevB.addEventListener("click", () => q("prev")?.click());
    const nextB = mkBtn("dnavbtn", "Next page");
    nextB.appendChild(ph("ph-caret-right"));
    nextB.addEventListener("click", () => q("next")?.click());
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = "1";
    inp.step = "1";
    inp.className = "dpageinp";
    inp.setAttribute("aria-label", "Page number");
    const st = parse();
    if (Number.isFinite(st.current)) inp.value = String(st.current);
    if (Number.isFinite(st.total)) inp.max = String(st.total);
    const go = () => {
      const p = parse();
      const target = parseInt(inp.value, 10);
      if (!Number.isFinite(p.current) || !Number.isFinite(p.total) || !Number.isFinite(target))
        return;
      const clamped = Math.min(Math.max(target, 1), p.total);
      const delta = clamped - p.current;
      const btn = q(delta > 0 ? "next" : "prev");
      for (let i = 0; i < Math.abs(delta); i++) btn?.click();
      closeMenu();
    };
    inp.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      go();
    });
    const goBtn = mkBtn("dnavbtn dgo", "Go to page");
    goBtn.textContent = "Go";
    goBtn.addEventListener("click", go);
    nav.append(prevB, inp, goBtn, nextB);
    menu.appendChild(nav);
    menu.appendChild(document.createElement("hr"));
    const props = mkBtn("ecmenu-item", "Document properties");
    const propLabel = document.createElement("span");
    propLabel.textContent = "Document properties";
    props.append(ph("ph-info"), propLabel);
    props.addEventListener("click", () => {
      closeMenu();
      q("docInfoBtn")?.click();
    });
    menu.appendChild(props);
    app.appendChild(menu);
    const dismiss = (e) => {
      if (e.target === pill || pill.contains(e.target)) return;
      closeMenu();
      window.removeEventListener("click", dismiss);
    };
    window.setTimeout(() => window.addEventListener("click", dismiss), 0);
  });
}
function setupFormatDock() {
  const inspector = q("inspector");
  const app = q("text-editor-app");
  const contextbar = q("contextbar");
  const alignTools = q("alignTools");
  const pStrokeRow = q("pStrokeRow");
  const scopeSel = q("editScope");
  const editBtn = document.querySelector('[data-tool="edit"]');
  if (!inspector || !app || !contextbar || !alignTools || !pStrokeRow || !editBtn || !(scopeSel instanceof HTMLSelectElement))
    return;
  inspector.classList.remove("collapsed");
  const rangeLinks = [];
  const panel = div("dockpanel");
  const clip = div("dockclip");
  const body = div("dockbody");
  const head = div("dockhead");
  const dtitle = div("dtitle");
  const dticon = document.createElement("span");
  const dtext = document.createElement("span");
  dtitle.append(dticon, dtext);
  const dclose = mkBtn("dclose", "Close panel");
  dclose.appendChild(ph("ph-x"));
  head.append(dtitle, dclose);
  const slotsWrap = div("dockslots");
  body.append(head, slotsWrap);
  clip.appendChild(body);
  panel.appendChild(clip);
  const rail = div("dockrail");
  const chipsWrap = div("dockchips");
  const acts = div("dockacts");
  const delChip = mkBtn("dchip ddel", "Delete");
  delChip.appendChild(ph("ph-trash"));
  delChip.addEventListener("click", () => q("del")?.click());
  acts.appendChild(delChip);
  rail.append(chipsWrap, acts);
  inspector.append(panel, rail);
  const slots = /* @__PURE__ */ new Map();
  const mkSlot = (id) => {
    const s = div("dslot");
    s.dataset.sec = id;
    slotsWrap.appendChild(s);
    slots.set(id, s);
    return s;
  };
  const sliderRow = (id, label) => {
    const num = numInput(id);
    if (!num) return null;
    const stepper = stepperOf(num);
    const row = div("dfield");
    const lab = div("dlab");
    lab.textContent = label;
    const range = document.createElement("input");
    range.type = "range";
    range.min = num.min;
    range.max = num.max;
    range.step = num.step;
    range.value = num.value || num.min;
    range.setAttribute("aria-label", label);
    range.addEventListener("pointerdown", () => {
      range.dataset.drag = "1";
    });
    range.addEventListener("pointerup", () => {
      delete range.dataset.drag;
    });
    range.addEventListener("input", () => {
      num.value = range.value;
    });
    range.addEventListener("change", () => {
      delete range.dataset.drag;
      num.value = range.value;
      num.dispatchEvent(new Event("change"));
    });
    rangeLinks.push({ range, num });
    row.append(lab, range, stepper ?? num);
    return row;
  };
  const sizeSlot = mkSlot("size");
  const fSize = numInput("fSize");
  if (fSize) {
    const sizer = div("dsizer");
    const step = (dir, icon, label) => {
      const b = mkBtn("dstep", label);
      b.appendChild(ph(icon));
      b.addEventListener("click", () => {
        if (fSize.disabled || fSize.value === "") return;
        if (dir > 0) fSize.stepUp();
        else fSize.stepDown();
        fSize.dispatchEvent(new Event("change"));
      });
      return b;
    };
    const minus = step(-1, "ph-minus", "Decrease size");
    const plus = step(1, "ph-plus", "Increase size");
    const host = stepperOf(fSize) ?? fSize;
    sizer.append(minus, host, plus);
    sizeSlot.appendChild(sizer);
  }
  const colorSlot = mkSlot("color");
  const colorRow = rowOf(q("fColor"));
  if (colorRow) colorSlot.appendChild(colorRow);
  const alignSlot = mkSlot("align");
  const alignRow = rowOf(q("fAlign"));
  if (alignRow) alignSlot.appendChild(alignRow);
  const dirLab = div("dlab dsublab");
  dirLab.textContent = "Direction";
  alignSlot.appendChild(dirLab);
  const dirRow = rowOf(q("fDir"));
  if (dirRow) alignSlot.appendChild(dirRow);
  const spacingSlot = mkSlot("spacing");
  for (const [id, label] of SLIDER_FIELDS) {
    const row = sliderRow(id, label);
    if (row) spacingSlot.appendChild(row);
  }
  const listsSlot = mkSlot("lists");
  const listsRow = rowOf(q("fList"));
  if (listsRow) listsSlot.appendChild(listsRow);
  const moreSlot = mkSlot("more");
  const outLab = div("dlab dsublab");
  outLab.textContent = "Outline";
  moreSlot.appendChild(outLab);
  const outlineRow = rowOf(q("fStrokeColor"));
  if (outlineRow) moreSlot.appendChild(outlineRow);
  for (const [id, label] of MORE_FIELDS) {
    const row = sliderRow(id, label);
    if (row) moreSlot.appendChild(row);
  }
  const strokeSlot = mkSlot("stroke");
  strokeSlot.appendChild(pStrokeRow);
  const multiSlot = mkSlot("alignMulti");
  multiSlot.appendChild(alignTools);
  const scopeSlot = mkSlot("scope");
  const scopeWrap = div("dscope");
  scopeSlot.appendChild(scopeWrap);
  let picked = /* @__PURE__ */ new Set(["all"]);
  const scopeDefs = [
    ["all", "All"],
    ["text", "Text"],
    ["image", "Images"],
    ["shape", "Shapes"]
  ];
  const renderScope = () => {
    scopeWrap.replaceChildren();
    for (const [key, label] of scopeDefs) {
      const b = mkBtn(`dscopebtn${picked.has(key) ? " on" : ""}`, label);
      b.textContent = label;
      b.addEventListener("click", () => {
        if (key === "all") picked = /* @__PURE__ */ new Set(["all"]);
        else {
          if (picked.has("all")) picked.clear();
          if (picked.has(key)) picked.delete(key);
          else picked.add(key);
          if (picked.size === 0 || picked.size === 3) picked = /* @__PURE__ */ new Set(["all"]);
        }
        applyScope();
      });
      scopeWrap.appendChild(b);
    }
  };
  const applyScope = () => {
    const value = [...picked].join(",");
    if (!scopeSel.querySelector(`option[value="${value}"]`)) {
      const o = document.createElement("option");
      o.value = value;
      scopeSel.appendChild(o);
    }
    scopeSel.value = value;
    scopeSel.dispatchEvent(new Event("change"));
    renderScope();
  };
  renderScope();
  let activeSec = null;
  let syncTimer = 0;
  const stopSync = () => {
    window.clearInterval(syncTimer);
    syncTimer = 0;
  };
  const startSync = () => {
    stopSync();
    syncTimer = window.setInterval(() => {
      for (const l of rangeLinks) {
        if (l.range.dataset.drag) continue;
        if (l.num.value !== "" && l.range.value !== l.num.value)
          l.range.value = l.num.value;
      }
    }, 400);
  };
  const syncRangesNow = () => {
    for (const l of rangeLinks) {
      if (l.num.value !== "") l.range.value = l.num.value;
    }
  };
  const setHead = (spec) => {
    dticon.replaceChildren(ph(spec.icon));
    dtext.textContent = spec.title;
  };
  const showSlot = (id) => {
    for (const [k, s] of slots) s.classList.toggle("act", k === id);
  };
  const closePanel = () => {
    panel.classList.remove("open");
    activeSec = null;
    stopSync();
    markActive();
  };
  const openSec = (spec) => {
    const isOpen = panel.classList.contains("open");
    if (isOpen && activeSec === spec.id) {
      closePanel();
      return;
    }
    if (isOpen) {
      body.classList.add("fading");
      window.setTimeout(() => {
        setHead(spec);
        showSlot(spec.id);
        body.classList.remove("fading");
      }, 120);
    } else {
      setHead(spec);
      showSlot(spec.id);
      panel.classList.add("open");
    }
    activeSec = spec.id;
    syncRangesNow();
    startSync();
    markActive();
  };
  dclose.addEventListener("click", closePanel);
  const dim = div("ddim");
  const sheet = div("dsheet");
  const grab = div("dgrab");
  grab.appendChild(document.createElement("span"));
  const shead = div("dsheethead");
  shead.append(ph("ph-text-aa"), document.createTextNode(" Select Font"));
  const fontListEl = div("dfontlist");
  sheet.append(grab, shead, fontListEl);
  inspector.append(dim, sheet);
  let sheetOpen = false;
  const rebuildFonts = () => {
    const fam = q("fFamily");
    if (!(fam instanceof HTMLSelectElement)) return;
    fontListEl.replaceChildren();
    const current = fam.value;
    for (const opt of Array.from(fam.options)) {
      const b = mkBtn(`dfrow${opt.value === current ? " on" : ""}`, opt.value);
      b.style.fontFamily = `"${opt.value.replace(/"/g, "")}", sans-serif`;
      const name = document.createElement("span");
      name.textContent = opt.value;
      const chk = ph("ph-check");
      chk.classList.add("dfchk");
      b.append(name, chk);
      b.addEventListener("click", () => {
        fam.value = opt.value;
        fam.dispatchEvent(new Event("change"));
        rebuildFonts();
        window.setTimeout(closeSheet, 180);
      });
      fontListEl.appendChild(b);
    }
    if ("queryLocalFonts" in window) {
      fontListEl.appendChild(div("ddivider"));
      const sys = mkBtn("dfrow dfsys", "Load system fonts");
      const label = document.createElement("span");
      label.textContent = "Load system fonts\u2026";
      sys.appendChild(label);
      sys.addEventListener("click", () => q("sysFonts")?.click());
      fontListEl.appendChild(sys);
    }
  };
  const openSheet = () => {
    rebuildFonts();
    sheetOpen = true;
    dim.classList.add("show");
    sheet.classList.add("open");
    markActive();
  };
  const closeSheet = () => {
    if (!sheetOpen) return;
    sheetOpen = false;
    dim.classList.remove("show");
    sheet.classList.remove("open");
    sheet.style.transform = "";
    markActive();
  };
  dim.addEventListener("click", closeSheet);
  let dragY = null;
  grab.addEventListener("pointerdown", (e) => {
    dragY = e.clientY;
    sheet.classList.add("drag");
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener("pointermove", (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.clientY - dragY);
    sheet.style.transform = `translateY(${dy}px)`;
  });
  const endDrag = (e) => {
    if (dragY === null) return;
    const dy = Math.max(0, e.clientY - dragY);
    dragY = null;
    sheet.classList.remove("drag");
    sheet.style.transform = "";
    if (dy > 90) closeSheet();
  };
  grab.addEventListener("pointerup", endDrag);
  grab.addEventListener("pointercancel", endDrag);
  const famSel = q("fFamily");
  if (famSel) {
    new MutationObserver(() => {
      if (sheetOpen) rebuildFonts();
    }).observe(famSel, { childList: true });
  }
  const visibleObjBtns = () => {
    const out = [];
    for (const id of OBJ_BTN_IDS) {
      const b = q(id);
      if (b instanceof HTMLButtonElement && !b.hidden) out.push(b);
    }
    return out;
  };
  const computeMode = () => {
    if (!inspector.hasAttribute("disabled")) return "text";
    if (visibleObjBtns().length || !alignTools.hidden) return "object";
    return "idle";
  };
  const secChip = (spec) => {
    const b = mkBtn("dchip", spec.title);
    b.dataset.sec = spec.id;
    b.appendChild(ph(spec.icon));
    b.addEventListener("click", () => {
      if (spec.id === "font") {
        if (sheetOpen) closeSheet();
        else openSheet();
      } else openSec(spec);
    });
    return b;
  };
  const proxyChip = (src) => {
    const b = mkBtn("dchip", src.title || "Action");
    b.dataset.proxy = src.id;
    const icon = src.querySelector("i");
    b.appendChild(
      icon ? icon.cloneNode(true) : ph("ph-circle")
    );
    b.addEventListener("click", () => src.click());
    return b;
  };
  const toolChip = (id, icon, label, onTap) => {
    const b = mkBtn("dchip", label);
    b.dataset.tool = id;
    b.appendChild(ph(icon));
    b.addEventListener("click", onTap);
    return b;
  };
  let lastMode = null;
  const togglesRow = q("fToggles");
  const toggleChip = (src) => {
    const b = mkBtn("dchip", src.title || "Toggle style");
    b.dataset.tog = src.dataset.t ?? "";
    const icon = src.querySelector("i");
    b.appendChild(
      icon ? icon.cloneNode(true) : ph("ph-circle")
    );
    b.addEventListener("click", () => src.click());
    return b;
  };
  const buildRail = () => {
    const mode = computeMode();
    chipsWrap.replaceChildren();
    if (mode === "text") {
      for (const s of TEXT_SECTIONS) {
        chipsWrap.appendChild(secChip(s));
        if (s.id === "color" && togglesRow) {
          for (const t2 of togglesRow.children) {
            if (t2 instanceof HTMLButtonElement)
              chipsWrap.appendChild(toggleChip(t2));
          }
        }
      }
    } else if (mode === "idle") {
      chipsWrap.appendChild(
        toolChip("edit", "ph-pencil-simple", "Edit tool", () => {
          if (editBtn.classList.contains("on")) openSec(SCOPE_SECTION);
          else {
            closePanel();
            applyScope();
          }
        })
      );
      chipsWrap.appendChild(
        toolChip("addText", "ph-textbox", "Add a text box", () => {
          closePanel();
          document.querySelector('[data-tool="addText"]')?.click();
        })
      );
      chipsWrap.appendChild(
        toolChip("addImage", "ph-image", "Add an image", () => {
          closePanel();
          q("addImage")?.click();
        })
      );
      chipsWrap.appendChild(
        toolChip("find", "ph-magnifying-glass", "Find & replace", () => {
          closePanel();
          q("find")?.click();
        })
      );
    }
    if (!alignTools.hidden) chipsWrap.appendChild(secChip(MULTI_SECTION));
    if (!pStrokeRow.hidden) chipsWrap.appendChild(secChip(STROKE_SECTION));
    for (const b of visibleObjBtns()) chipsWrap.appendChild(proxyChip(b));
    const delBtn = q("del");
    acts.hidden = !(delBtn instanceof HTMLButtonElement) || delBtn.hidden;
    markActive();
  };
  function markActive() {
    const editOn = editBtn.classList.contains("on");
    for (const c of chipsWrap.children) {
      if (!(c instanceof HTMLElement)) continue;
      if (c.dataset.sec) {
        c.classList.toggle(
          "on",
          c.dataset.sec === "font" ? sheetOpen : c.dataset.sec === activeSec
        );
      } else if (c.dataset.tog) {
        const src = togglesRow?.querySelector(`[data-t="${c.dataset.tog}"]`);
        c.classList.toggle("on", !!src?.classList.contains("on"));
      } else if (c.dataset.tool === "edit") {
        c.classList.toggle("on", editOn || activeSec === "scope");
      } else if (c.dataset.tool === "addText") {
        c.classList.toggle("on", !editOn);
      }
    }
  }
  let raf = 0;
  const refresh = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const mode = computeMode();
      if (mode !== lastMode) {
        closePanel();
        closeSheet();
        lastMode = mode;
      }
      buildRail();
      if (activeSec && !chipsWrap.querySelector(`[data-sec="${activeSec}"]`))
        closePanel();
    });
  };
  new MutationObserver(refresh).observe(inspector, {
    attributes: true,
    attributeFilter: ["disabled", "hidden"]
  });
  new MutationObserver(refresh).observe(contextbar, {
    attributes: true,
    subtree: true,
    attributeFilter: ["hidden"]
  });
  new MutationObserver(refresh).observe(alignTools, {
    attributes: true,
    attributeFilter: ["hidden"]
  });
  new MutationObserver(refresh).observe(pStrokeRow, {
    attributes: true,
    attributeFilter: ["hidden"]
  });
  new MutationObserver(() => markActive()).observe(editBtn, {
    attributes: true,
    attributeFilter: ["class"]
  });
  if (togglesRow) {
    new MutationObserver(() => markActive()).observe(togglesRow, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"]
    });
  }
  const vv = window.visualViewport;
  if (vv) {
    const updateOffset = () => {
      const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      app.style.setProperty("--eckb", `${Math.round(off)}px`);
    };
    vv.addEventListener("resize", updateOffset);
    vv.addEventListener("scroll", updateOffset);
    updateOffset();
  }
  const publishDockHeight = () => {
    app.style.setProperty(
      "--ecdock",
      `${Math.round(inspector.getBoundingClientRect().height)}px`
    );
  };
  new ResizeObserver(publishDockHeight).observe(inspector);
  publishDockHeight();
  setupPagePill();
  refresh();
}
function setupFindSheet() {
  const findbar = q("findbar");
  if (!findbar) return;
  const closeFind = () => q("findDone")?.click();
  const grab = div("ecgrab");
  grab.appendChild(document.createElement("span"));
  findbar.prepend(grab);
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let vel = 0;
  let mode = "idle";
  const onStart = (e) => {
    if (e.touches.length !== 1) return;
    startY = lastY = e.touches[0].clientY;
    lastT = performance.now();
    vel = 0;
    const onGrab = e.target?.closest(".ecgrab");
    mode = onGrab ? "drag" : "undecided";
  };
  const onMove = (e) => {
    if (mode === "idle" || mode === "scroll") return;
    const y = e.touches[0].clientY;
    const dy = y - startY;
    if (mode === "undecided") {
      if (Math.abs(dy) < 6) return;
      if (dy > 0 && findbar.scrollTop <= 0) mode = "drag";
      else {
        mode = "scroll";
        return;
      }
    }
    e.preventDefault();
    const now = performance.now();
    vel = (y - lastY) / Math.max(1, now - lastT);
    lastY = y;
    lastT = now;
    findbar.style.transform = `translateY(${Math.max(0, y - startY)}px)`;
  };
  const onEnd = () => {
    if (mode !== "drag") {
      mode = "idle";
      return;
    }
    mode = "idle";
    const dy = Math.max(0, lastY - startY);
    findbar.style.transform = "";
    if (dy > 90 || vel > 0.55) {
      const anim = findbar.animate(
        [
          { transform: `translateY(${dy}px)` },
          { transform: "translateY(110%)" }
        ],
        { duration: 160, easing: "ease-in" }
      );
      anim.onfinish = () => closeFind();
    } else if (dy > 0) {
      findbar.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
        { duration: 160, easing: "ease-out" }
      );
    }
  };
  findbar.addEventListener("touchstart", onStart, { passive: true });
  findbar.addEventListener("touchmove", onMove, { passive: false });
  findbar.addEventListener("touchend", onEnd);
  findbar.addEventListener("touchcancel", onEnd);
  let findWasOpen = !findbar.hidden;
  new MutationObserver(() => {
    const open = !findbar.hidden;
    if (open && !findWasOpen) {
      findbar.animate(
        [{ transform: "translateY(40px)" }, { transform: "none" }],
        { duration: 200, easing: "ease-out" }
      );
    }
    findWasOpen = open;
  }).observe(findbar, { attributes: true, attributeFilter: ["hidden"] });
}

// public/edit-pdf-viewer/edit-pdf-text-page-patched.ts
function buildMenu(anchor, cls) {
  const menu = document.createElement("div");
  menu.className = `ecmenu ${cls}`;
  const rect = anchor.getBoundingClientRect();
  const app = document.getElementById("text-editor-app");
  if (!app) return menu;
  if (rect.top > window.innerHeight / 2) {
    menu.style.bottom = `${window.innerHeight - rect.top + 6}px`;
  } else {
    menu.style.top = `${rect.bottom + 6}px`;
  }
  menu.style.left = `${Math.max(8, rect.left)}px`;
  menu.addEventListener("click", (e) => e.stopPropagation());
  app.appendChild(menu);
  const dismiss = (e) => {
    if (e.target === anchor || anchor.contains(e.target)) return;
    menu.remove();
    window.removeEventListener("click", dismiss);
  };
  window.setTimeout(() => window.addEventListener("click", dismiss), 0);
  return menu;
}
function menuItem(label, checked, onPick, icon) {
  const item = document.createElement("button");
  item.className = "ecmenu-item";
  const mark = document.createElement("i");
  mark.className = checked ? "ph ph-check" : "ecmenu-blank";
  const text = document.createElement("span");
  text.textContent = label;
  if (icon) {
    const glyph = document.createElement("i");
    glyph.className = `ph ${icon} ecmenu-icon`;
    item.append(mark, glyph, text);
  } else {
    item.append(mark, text);
  }
  item.addEventListener("click", onPick);
  return item;
}
var SCOPES = [
  ["text", "Edit Text", "ph-text-t"],
  ["image", "Edit Images", "ph-image"],
  ["shape", "Edit Shapes", "ph-shapes"]
];
function setupEditMenu() {
  const editBtn = document.querySelector(
    '#tools [data-tool="edit"]'
  );
  const label = document.getElementById("editLabel");
  const scopeSel = document.getElementById(
    "editScope"
  );
  if (!editBtn || !label || !scopeSel) return;
  let picked = /* @__PURE__ */ new Set(["all"]);
  const apply = () => {
    const value = [...picked].join(",");
    if (!scopeSel.querySelector(`option[value="${value}"]`)) {
      const opt = document.createElement("option");
      opt.value = value;
      scopeSel.appendChild(opt);
    }
    scopeSel.value = value;
    scopeSel.dispatchEvent(new Event("change"));
    label.textContent = picked.has("all") ? "Edit All" : "Edit " + SCOPES.filter(([k]) => picked.has(k)).map(([, l]) => l.replace("Edit ", "")).join(" + ");
  };
  let open = null;
  const caret = editBtn.querySelector(".editcaret");
  const markOpen = (isOpen) => caret?.classList.toggle("up", isOpen);
  editBtn.addEventListener("click", () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      markOpen(false);
      return;
    }
    const menu = buildMenu(editBtn, "editmenu");
    open = menu;
    markOpen(true);
    const watch = new MutationObserver(() => {
      if (!menu.isConnected) {
        markOpen(false);
        watch.disconnect();
      }
    });
    const host = menu.parentElement;
    if (host) watch.observe(host, { childList: true });
    const rebuild = () => {
      menu.replaceChildren();
      menu.appendChild(
        menuItem(
          "Edit All",
          picked.has("all"),
          () => {
            picked = /* @__PURE__ */ new Set(["all"]);
            apply();
            rebuild();
          },
          "ph-selection-all"
        )
      );
      for (const [key, lbl, glyph] of SCOPES) {
        menu.appendChild(
          menuItem(
            lbl,
            picked.has(key),
            () => {
              if (picked.has("all")) picked.clear();
              if (picked.has(key)) picked.delete(key);
              else picked.add(key);
              if (picked.size === 0 || picked.size === SCOPES.length)
                picked = /* @__PURE__ */ new Set(["all"]);
              apply();
              rebuild();
            },
            glyph
          )
        );
      }
    };
    rebuild();
  });
}
var ZOOM_PRESETS = [50, 75, 100, 125, 150, 200, 400];
function zoomRow(label, active, icon, onPick) {
  const item = document.createElement("button");
  item.className = `ecmenu-item${active ? " active" : ""}`;
  if (icon) {
    const i = document.createElement("i");
    i.className = `ph ${icon}`;
    item.appendChild(i);
  }
  const text = document.createElement("span");
  text.textContent = label;
  item.appendChild(text);
  item.addEventListener("click", onPick);
  return item;
}
function fitPage() {
  const stage = document.getElementById("stage");
  const wrap = document.getElementById("pageWrap");
  const mod = appModule;
  if (!stage || !wrap || !mod) return;
  const z = mod.getZoom();
  const pw = wrap.offsetWidth / z;
  const ph2 = wrap.offsetHeight / z;
  if (pw <= 0 || ph2 <= 0) return;
  mod.setZoom(
    Math.min((stage.clientWidth - 48) / pw, (stage.clientHeight - 48) / ph2)
  );
}
function setupZoomMenu() {
  const btn = document.getElementById("zoomMenuBtn");
  const zoomLabel = document.getElementById("zoomLabel");
  if (!btn || !zoomLabel) return;
  let open = null;
  btn.addEventListener("click", () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      return;
    }
    const current = parseInt(zoomLabel.textContent ?? "", 10);
    const menu = buildMenu(btn, "zoommenu");
    open = menu;
    for (const pct of ZOOM_PRESETS) {
      menu.appendChild(
        zoomRow(`${pct}%`, current === pct, null, () => {
          appModule?.setZoom(pct / 100);
          menu.remove();
        })
      );
    }
    menu.appendChild(document.createElement("hr"));
    menu.appendChild(
      zoomRow("Fit to Page", false, "ph-arrows-out", () => {
        fitPage();
        menu.remove();
      })
    );
    menu.appendChild(
      zoomRow("Fit to Width", false, "ph-arrows-out-line-horizontal", () => {
        document.getElementById("zoomFit")?.click();
        menu.remove();
      })
    );
    menu.appendChild(document.createElement("hr"));
    const form = document.createElement("form");
    form.className = "zoomcustom";
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = "20";
    inp.max = "600";
    inp.placeholder = "Custom Zoom";
    const pctSpan = document.createElement("span");
    pctSpan.textContent = "%";
    form.append(inp, pctSpan);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = parseFloat(inp.value);
      if (Number.isFinite(v) && v >= 20 && v <= 600) {
        appModule?.setZoom(v / 100);
        menu.remove();
      }
    });
    menu.appendChild(form);
    window.setTimeout(() => inp.focus(), 0);
  });
}
function setupBarCollapse() {
  const viewbar = document.getElementById("viewbar");
  const collapse = document.getElementById("vbCollapse");
  const restore = document.getElementById("vbRestore");
  if (!viewbar || !collapse || !restore) return;
  collapse.addEventListener("click", () => {
    viewbar.setAttribute("hidden", "");
    restore.removeAttribute("hidden");
  });
  restore.addEventListener("click", () => {
    viewbar.removeAttribute("hidden");
    restore.setAttribute("hidden", "");
  });
}
function formatPdfDate(raw) {
  const m = raw.match(/D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  if (!m) return raw;
  const [, y, mo, d, h, mi] = m;
  let out = `${y}`;
  if (mo) out = `${mo}/${d ?? "01"}/${y}`;
  if (h) out += `, ${h}:${mi ?? "00"}`;
  return out;
}
function relocateAddText() {
  const addTextBtn = document.querySelector(
    '#tools [data-tool="addText"]'
  );
  const editBtn = document.querySelector(
    '#tools [data-tool="edit"]'
  );
  const findBtn = document.getElementById("find");
  if (!addTextBtn || !editBtn || !findBtn?.parentElement) return;
  addTextBtn.replaceChildren();
  const icon = document.createElement("i");
  icon.className = "ph ph-text-t";
  addTextBtn.appendChild(icon);
  addTextBtn.classList.add("btn", "icon");
  addTextBtn.title = "Add a text box";
  findBtn.parentElement.insertBefore(addTextBtn, findBtn);
  const sync = () => addTextBtn.classList.toggle("on", !editBtn.classList.contains("on"));
  new MutationObserver(sync).observe(editBtn, {
    attributes: true,
    attributeFilter: ["class"]
  });
  sync();
}
function setupDocPanel() {
  const btn = document.getElementById("docInfoBtn");
  const app = document.getElementById("text-editor-app");
  if (!btn || !app) return;
  let overlay = null;
  const close = () => {
    overlay?.remove();
    overlay = null;
  };
  btn.addEventListener("click", () => {
    if (overlay) {
      close();
      return;
    }
    const desc = appModule?.getDocDescription();
    if (!desc?.meta) return;
    overlay = document.createElement("div");
    overlay.id = "docModalOverlay";
    overlay.addEventListener("click", close);
    const modal = document.createElement("div");
    modal.id = "docModal";
    modal.addEventListener("click", (e) => e.stopPropagation());
    const head = document.createElement("div");
    head.className = "docmodal-head";
    const title = document.createElement("span");
    title.textContent = "Document Properties";
    const x = document.createElement("button");
    x.className = "btn icon";
    x.title = "Close";
    const xi = document.createElement("i");
    xi.className = "ph ph-x";
    x.appendChild(xi);
    x.addEventListener("click", close);
    head.append(title, x);
    modal.appendChild(head);
    const f = desc.fields ?? {};
    const inch = (pt) => (pt / 72).toFixed(2);
    const groups = [
      [
        "Description",
        [
          ["File", desc.meta.name],
          ["Title", f.Title || "\u2014"],
          ["Author", f.Author || "\u2014"],
          ["Subject", f.Subject || "\u2014"],
          ["Keywords", f.Keywords || "\u2014"],
          ["Created", f.CreationDate ? formatPdfDate(f.CreationDate) : "\u2014"],
          ["Modified", f.ModDate ? formatPdfDate(f.ModDate) : "\u2014"],
          ["Application", f.Creator || "\u2014"]
        ]
      ],
      [
        "Advanced",
        [
          ["PDF Producer", f.Producer || "\u2014"],
          ["File Size", `${(desc.meta.size / 1024).toFixed(0)} KB`],
          [
            "Page Size",
            desc.pageSize ? `${inch(desc.pageSize.w)} \xD7 ${inch(desc.pageSize.h)} in` : "\u2014"
          ],
          ["Number of Pages", desc.info?.pages ? String(desc.info.pages) : "\u2014"],
          ...desc.info?.signatures ? [["Signatures", String(desc.info.signatures)]] : [],
          ...desc.pdfa ? [["Conformance", "PDF/A"]] : []
        ]
      ]
    ];
    for (const [name, rows] of groups) {
      const sect = document.createElement("section");
      const h = document.createElement("h4");
      h.textContent = name;
      sect.appendChild(h);
      const dl = document.createElement("dl");
      for (const [k, v] of rows) {
        const dt = document.createElement("dt");
        dt.textContent = k;
        const dd = document.createElement("dd");
        dd.textContent = v;
        dl.append(dt, dd);
      }
      sect.appendChild(dl);
      modal.appendChild(sect);
    }
    overlay.appendChild(modal);
    app.appendChild(overlay);
  });
}
var appModule = null;
function closeEditor() {
  document.getElementById("text-editor-app")?.setAttribute("hidden", "");
  document.getElementById("uploader")?.classList.remove("hidden");
  document.getElementById("tool-landing")?.classList.remove("hidden");
}
var launching = false;
function fitMobileWidth() {
  const mod = appModule;
  const stage = document.getElementById("stage");
  const wrap = document.getElementById("pageWrap");
  if (!mod || !stage || !wrap) return;
  const w = wrap.getBoundingClientRect().width;
  if (!(w > 0) || !(stage.clientWidth > 0)) return;
  const target = Math.min(
    6,
    Math.max(0.2, mod.getZoom() * ((stage.clientWidth - 20) / w))
  );
  mod.setZoom(target);
}
async function launchEditor(file) {
  if (launching) return;
  launching = true;
  showLoader("Loading PDF Text Editor...");
  try {
    hideLoader();
    const decrypted = await batchDecryptIfNeeded([file]);
    if (decrypted.length === 0) return;
    showLoader("Loading PDF Text Editor...");
    document.getElementById("uploader")?.classList.add("hidden");
    document.getElementById("tool-landing")?.classList.add("hidden");
    document.getElementById("text-editor-app")?.removeAttribute("hidden");
    if (!appModule) {
      appModule = await import("../editcore/app.js");
      appModule.setOnSaved((kb) => {
        showAlert(
          t("common.success"),
          t("tools:editPdfText.saved", { size: kb }),
          "success",
          () => {
            closeEditor();
          }
        );
      });
      relocateAddText();
      setupDocPanel();
      setupEditMenu();
      setupZoomMenu();
      setupBarCollapse();
    }
    const engineOk = await appModule.engineReady;
    if (!engineOk) {
      throw new Error("WASM engine failed to initialize");
    }
    await appModule.openFile(decrypted[0]);
    if (window.matchMedia("(max-width: 768px)").matches) fitMobileWidth();
  } catch (error) {
    console.error("Error loading PDF Text Editor:", error);
    showAlert(t("common.error"), t("tools:editPdfText.failedToLoad"));
    closeEditor();
  } finally {
    hideLoader();
    launching = false;
  }
}
function handleFiles(files) {
  const pdf = Array.from(files).find(
    (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name)
  );
  if (!pdf) {
    showAlert("Invalid File", "Please upload a valid PDF file.");
    return;
  }
  void launchEditor(pdf);
}
function attachSteppers() {
  const inputs = document.querySelectorAll(
    "#inspector input.num"
  );
  for (const input of inputs) {
    const wrap = document.createElement("div");
    wrap.className = "stepper";
    input.replaceWith(wrap);
    const mk = (dir, icon) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stepbtn";
      b.tabIndex = -1;
      const i = document.createElement("i");
      i.className = `ph ${icon}`;
      b.appendChild(i);
      b.addEventListener("click", () => {
        if (input.disabled || input.value === "") return;
        if (dir > 0) input.stepUp();
        else input.stepDown();
        input.dispatchEvent(new Event("change"));
      });
      return b;
    };
    const col = document.createElement("div");
    col.className = "stepcol";
    col.append(mk(1, "ph-caret-up"), mk(-1, "ph-caret-down"));
    wrap.append(input, col);
  }
}
function showMobileHistory() {
  const undo = document.getElementById("undo");
  const redo = document.getElementById("redo");
  const host = document.getElementById("save")?.parentElement;
  if (!undo || !redo || !host) return;
  for (const b of [undo, redo]) {
    b.removeAttribute("hidden");
    b.classList.add("btn", "icon");
  }
  host.append(undo, redo);
}
function initializePage() {
  createIcons({ icons });
  attachSteppers();
  const fileInput = document.getElementById("file-input");
  const dropZone = document.getElementById("drop-zone");
  if (fileInput) {
    const onPick = (e) => {
      const input = e.target;
      if (input.files && input.files.length > 0) {
        handleFiles(input.files);
      }
    };
    fileInput.addEventListener("change", onPick);
    fileInput.addEventListener("input", onPick);
    fileInput.addEventListener("click", () => {
      fileInput.value = "";
    });
  }
  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("border-indigo-500");
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("border-indigo-500");
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("border-indigo-500");
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    });
  }
  for (const id of ["stage", "inspector"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    let timer = 0;
    el.addEventListener(
      "scroll",
      () => {
        el.classList.add("is-scrolling");
        window.clearTimeout(timer);
        timer = window.setTimeout(
          () => el.classList.remove("is-scrolling"),
          700
        );
      },
      { passive: true }
    );
  }
  const inspector = document.getElementById("inspector");
  const toggleInspector = document.getElementById("toggleInspector");
  if (inspector && toggleInspector) {
    toggleInspector.classList.add("on");
    toggleInspector.addEventListener("click", () => {
      inspector.classList.toggle("collapsed");
      toggleInspector.classList.toggle(
        "on",
        !inspector.classList.contains("collapsed")
      );
    });
    if (window.matchMedia("(max-width: 768px)").matches) {
      toggleInspector.classList.remove("on");
      setupFormatDock();
      setupFindSheet();
      showMobileHistory();
    }
  }
  const findBtn = document.getElementById("find");
  const findbar = document.getElementById("findbar");
  if (findBtn && findbar) {
    const sync = () => findBtn.classList.toggle("on", !findbar.hidden);
    new MutationObserver(sync).observe(findbar, {
      attributes: true,
      attributeFilter: ["hidden"]
    });
    sync();
  }
  const hud = document.getElementById("zoomHud");
  if (hud) {
    hud.removeAttribute("hidden");
    let hudTimer = 0;
    const flash = (text) => {
      if (!document.getElementById("viewbar")?.hidden) return;
      if (!text || text.includes("\u2013")) return;
      hud.textContent = text;
      hud.classList.add("show");
      window.clearTimeout(hudTimer);
      hudTimer = window.setTimeout(() => hud.classList.remove("show"), 900);
    };
    for (const id of ["zoomLabel", "pageLabel"]) {
      const label = document.getElementById(id);
      if (!label) continue;
      let last = label.textContent ?? "";
      new MutationObserver(() => {
        const now = label.textContent ?? "";
        if (now === last) return;
        last = now;
        if (document.activeElement === label) return;
        flash(now);
      }).observe(label, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }
  const pageLabel = document.getElementById("pageLabel");
  const pageInput = document.getElementById(
    "pageInput"
  );
  const pageTotal = document.getElementById("pageTotal");
  if (pageLabel && pageInput && pageTotal) {
    const parse = () => {
      const parts = (pageLabel.textContent ?? "").split("/");
      return {
        current: parseInt(parts[0] ?? "", 10),
        total: parseInt(parts[1] ?? "", 10)
      };
    };
    const sync = () => {
      const { current, total } = parse();
      if (!Number.isFinite(current) || !Number.isFinite(total)) return;
      if (document.activeElement !== pageInput)
        pageInput.value = String(current);
      pageInput.max = String(total);
      pageTotal.textContent = `/ ${total}`;
    };
    new MutationObserver(sync).observe(pageLabel, {
      childList: true,
      characterData: true,
      subtree: true
    });
    sync();
    pageInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        sync();
        pageInput.blur();
        return;
      }
      if (e.key !== "Enter") return;
      e.preventDefault();
      const { current, total } = parse();
      const target = parseInt(pageInput.value, 10);
      pageInput.blur();
      if (!Number.isFinite(current) || !Number.isFinite(total) || !Number.isFinite(target)) {
        sync();
        return;
      }
      const clamped = Math.min(Math.max(target, 1), total);
      const delta = clamped - current;
      if (delta === 0) {
        sync();
        return;
      }
      const btn = document.getElementById(delta > 0 ? "next" : "prev");
      for (let i = 0; i < Math.abs(delta); i++) btn?.click();
    });
    pageInput.addEventListener("blur", sync);
  }
  const findText = document.getElementById(
    "findText"
  );
  if (findText) {
    let searchTimer = 0;
    findText.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      if (!findText.value.trim()) return;
      searchTimer = window.setTimeout(() => {
        document.getElementById("findNext")?.click();
      }, 350);
    });
  }
  const stage = document.getElementById("stage");
  const pageWrap = document.getElementById("pageWrap");
  if (stage && pageWrap) {
    let commitTimer = 0;
    let gestureScale = 1;
    let active = false;
    let focusX = 0;
    let focusY = 0;
    const beginGesture = (clientX, clientY) => {
      active = true;
      gestureScale = 1;
      const wrapRect = pageWrap.getBoundingClientRect();
      focusX = clientX - wrapRect.left;
      focusY = clientY - wrapRect.top;
      pageWrap.style.transformOrigin = `${focusX}px ${focusY}px`;
      pageWrap.style.willChange = "transform";
    };
    const commitGesture = () => {
      active = false;
      const mod = appModule;
      if (!mod) return;
      const startZoom = mod.getZoom();
      const target = Math.min(6, Math.max(0.2, startZoom * gestureScale));
      const applied = target / startZoom;
      const preLeft = stage.scrollLeft;
      const preTop = stage.scrollTop;
      pageWrap.style.transform = "";
      pageWrap.style.willChange = "";
      mod.setZoom(target);
      stage.scrollLeft = preLeft + focusX * (applied - 1);
      stage.scrollTop = preTop + focusY * (applied - 1);
      gestureScale = 1;
    };
    stage.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        if (!appModule) return;
        if (!active) beginGesture(e.clientX, e.clientY);
        else window.clearTimeout(commitTimer);
        gestureScale *= 1 - e.deltaY * 0.01;
        gestureScale = Math.max(0.1, Math.min(10, gestureScale));
        pageWrap.style.transform = `scale(${gestureScale})`;
        commitTimer = window.setTimeout(commitGesture, 150);
      },
      { passive: false }
    );
    let pinchD0 = 0;
    let pinchBase = 1;
    stage.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 2 || !appModule) return;
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchD0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (!(pinchD0 > 0)) return;
        window.clearTimeout(commitTimer);
        if (!active) {
          beginGesture(
            (a.clientX + b.clientX) / 2,
            (a.clientY + b.clientY) / 2
          );
        }
        pinchBase = gestureScale;
      },
      { passive: false }
    );
    stage.addEventListener(
      "touchmove",
      (e) => {
        if (!active || e.touches.length !== 2 || !(pinchD0 > 0)) return;
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        gestureScale = Math.max(0.1, Math.min(10, pinchBase * (d / pinchD0)));
        pageWrap.style.transform = `scale(${gestureScale})`;
      },
      { passive: false }
    );
    const endPinch = (e) => {
      if (!active || !(pinchD0 > 0)) return;
      if (e.touches.length >= 2) return;
      pinchD0 = 0;
      window.clearTimeout(commitTimer);
      commitTimer = window.setTimeout(commitGesture, 60);
    };
    stage.addEventListener("touchend", endPinch);
    stage.addEventListener("touchcancel", endPinch);
  }
  const mainEl = document.getElementById("main");
  if (mainEl) {
    const DRAG_SEL = ".obj-handle,.rot-handle,.para-handle,.edit-move,.multi-box,.obj-box,.sel-para";
    mainEl.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        const t2 = e.target;
        const grip = t2?.closest?.(DRAG_SEL);
        if (!grip) return;
        e.preventDefault();
        const tt = e.touches[0];
        grip.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            clientX: tt.clientX,
            clientY: tt.clientY,
            buttons: 1
          })
        );
        const move = (ev) => {
          ev.preventDefault();
          const m = ev.touches[0];
          if (!m) return;
          window.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: m.clientX,
              clientY: m.clientY,
              buttons: 1
            })
          );
        };
        const end = (ev) => {
          const m = ev.changedTouches[0];
          window.dispatchEvent(
            new MouseEvent("mouseup", {
              clientX: m?.clientX ?? tt.clientX,
              clientY: m?.clientY ?? tt.clientY
            })
          );
          grip.removeEventListener("touchmove", move);
          grip.removeEventListener("touchend", end);
          grip.removeEventListener("touchcancel", end);
        };
        grip.addEventListener("touchmove", move, { passive: false });
        grip.addEventListener("touchend", end);
        grip.addEventListener("touchcancel", end);
      },
      { passive: false }
    );
  }
  if (window.visualViewport) {
    let kbTimer = 0;
    let lastVh = window.visualViewport.height;
    const app = document.getElementById("text-editor-app");
    window.visualViewport.addEventListener("resize", () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const shrunk = vv.height < lastVh - 80;
      lastVh = vv.height;
      app?.classList.toggle("kb-open", window.innerHeight - vv.height > 150);
      if (!shrunk) return;
      window.clearTimeout(kbTimer);
      kbTimer = window.setTimeout(() => {
        const ed = document.querySelector("#overlay .editor");
        ed?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 120);
    });
  }
  document.getElementById("back-to-tools")?.addEventListener("click", () => {
    if (window.parent !== window) window.parent.postMessage({ type: "edit-pdf-exit" }, "*");
    else window.location.href = import.meta.env.BASE_URL;
  });
  document.getElementById("exitEditor")?.addEventListener("click", () => {
    if (window.parent !== window) window.parent.postMessage({ type: "edit-pdf-exit" }, "*");
    else window.location.reload();
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}
