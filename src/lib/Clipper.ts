export interface ClipperResponse {
  ok?: ElementMetadata;
  error?: any;
}
export interface ClipperArgs {
  el?: HTMLElement | undefined;
}

export interface ElementMetadata {
  tagName: string;
  id?: string;
  classList: string[];
  innerText?: string;
  innerHTML?: string;
  attributes: { [key: string]: string };
}

export async function clip(args: ClipperArgs): Promise<ClipperResponse> {
  const { el } = args;

  if (!el) {
    return { error: "No element provided" };
  }

  try {
    // Extract metadata from the element
    const metadata: ElementMetadata = {
      tagName: el.tagName,
      id: el.id || undefined,
      classList: Array.from(el.classList),
      innerText: el.innerText || undefined,
      innerHTML: el.innerHTML || undefined,
      attributes: {},
    };
    // Populate the attributes object
    Array.from(el.attributes).forEach((attr) => {
      metadata.attributes[attr.name] = attr.value;
    });
    return { ok: metadata };
  } catch (error) {
    return { error };
  }
}
