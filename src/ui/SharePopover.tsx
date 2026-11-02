import { encodeShareHash } from '../model/codec';
import { useStore } from '../model/store';

export default function SharePopover() {
  const design = useStore((state) => state.design);
  const showToast = useStore((state) => state.showToast);
  const url = `${location.origin}${location.pathname}#${encodeShareHash(design)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } catch {
      showToast('Copy the link above');
    }
  }

  return (
    <div className="share-popover">
      <label htmlFor="share-url">Share this design</label>
      <input id="share-url" className="share-url" data-testid="share-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      <button type="button" className="toolbar-button" onClick={copyLink}>Copy link</button>
    </div>
  );
}
