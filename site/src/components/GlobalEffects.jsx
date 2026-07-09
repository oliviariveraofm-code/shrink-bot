import GoldDust from "./GoldDust";
import ScrollAberration from "./ScrollAberration";

export default function GlobalEffects() {
  return (
    <>
      <GoldDust />
      <ScrollAberration />
      <div className="vignette" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
    </>
  );
}
