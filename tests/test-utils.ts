/**
 * Headlines that use GR-019's renderEmphasis() split one phrase into its own
 * <em>, so the full sentence is no longer a single text node — this is RTL's
 * documented pattern for matching text split across elements.
 */
export function fullText(text: string) {
  return (_content: string, element: Element | null) => {
    if (!element) return false;
    const hasText = (el: Element) => el.textContent === text;
    const childrenDontHaveText = Array.from(element.children).every(
      (child) => !hasText(child)
    );
    return hasText(element) && childrenDontHaveText;
  };
}
