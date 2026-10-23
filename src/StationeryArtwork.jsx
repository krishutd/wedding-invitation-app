/** The original transparent artwork is already complete after the opening interlude. */
export default function StationeryArtwork({ src, alt }) {
  return <div className="divine-art-stage stationery-art">
    <img className="divine-art" width="1150" height="1367" src={src} alt={alt} decoding="async" />
  </div>;
}
