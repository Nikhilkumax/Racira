/**
 * Minimal Sortable type stub.
 * In the original BentoPDF, this was the 'sortablejs' npm package.
 * Sortable is drag-and-drop UI, not processing logic.
 * The Sortable references in these files should be removed during the wiring phase.
 *
 * @deprecated — Remove all Sortable usage during wiring phase.
 */
declare namespace Sortable {
  interface SortableEvent {
    oldIndex?: number;
    newIndex?: number;
    item: HTMLElement;
    from: HTMLElement;
    to: HTMLElement;
  }
  interface Options {
    animation?: number;
    handle?: string;
    onStart?: (evt: SortableEvent) => void;
    onEnd?: (evt: SortableEvent) => void;
  }
  function create(el: HTMLElement, options?: Options): SortableInstance;
  interface SortableInstance {
    destroy(): void;
  }
}

declare class Sortable implements Sortable.SortableInstance {
  static create(el: HTMLElement, options?: Sortable.Options): Sortable;
  destroy(): void;
}
