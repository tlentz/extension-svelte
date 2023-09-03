import getXPath from "get-xpath";
import { getCssSelector } from "css-selector-generator";

export interface ClipperResponse {
  ok?: ElementMetadata;
  error?: any;
}
export interface ClipperArgs {
  el?: HTMLElement | undefined;
}

export interface ElementMetadata {
  tagName: string;
  selector: string;
  xpath: string;
  id?: string;
  classList: string[];
  innerText?: string;
  innerHTML?: string;
  attributes: { [key: string]: string };
  dimensions?: {
    width: number;
    height: number;
    boundingClientRect: DOMRect;
  };
  styles?: {
    color?: string;
    fontSize?: string;
    backgroundColor?: string;
  };
  position?: {
    offsetTop: number;
    offsetLeft: number;
    clientTop: number;
    clientLeft: number;
  };
  dataset?: DOMStringMap;
  parentInfo?: {
    tagName: string;
    id?: string;
  };
  childrenCount?: number;
  absolutePosition?: { top: number; left: number };
}

function getAbsolutePosition(el: HTMLElement): { top: number; left: number } {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
  };
}

export async function clip(args: ClipperArgs): Promise<ClipperResponse> {
  const { el } = args;
  if (!el) {
    return {
      error: "No HTMLElement provided.",
    };
  }

  try {
    const computedStyles = getComputedStyle(el);
    const metadata: ElementMetadata = {
      tagName: el.tagName,
      selector: getCssSelector(el),
      xpath: getXPath(el),
      id: el.id || undefined,
      classList: Array.from(el.classList),
      innerText: el.innerText.slice(0, 100) || undefined, // Truncate long text for display
      innerHTML: el.innerHTML.slice(0, 100) || undefined, // Truncate long HTML for display
      attributes: {},
      dimensions: {
        width: el.offsetWidth,
        height: el.offsetHeight,
        boundingClientRect: el.getBoundingClientRect(),
      },
      styles: {
        color: computedStyles.color,
        fontSize: computedStyles.fontSize,
        backgroundColor: computedStyles.backgroundColor,
      },
      position: {
        offsetTop: el.offsetTop,
        offsetLeft: el.offsetLeft,
        clientTop: el.clientTop,
        clientLeft: el.clientLeft,
      },
      dataset: el.dataset,
      parentInfo: el.parentElement
        ? {
            tagName: el.parentElement.tagName,
            id: el.parentElement.id || undefined,
          }
        : undefined,
      childrenCount: el.children.length,
      absolutePosition: getAbsolutePosition(el),
    };

    Array.from(el.attributes).forEach((attr) => {
      metadata.attributes[attr.name] = attr.value;
    });

    return {
      ok: metadata,
    };
  } catch (error) {
    return {
      error: `Failed to extract metadata from the element: ${error}`,
    };
  }
}
