import cowboyGuy from "../assets/cowboyGuy.png";
import lilGuy from "../assets/lilGuy.png";
import peakyGuy from "../assets/peakyGuy.png";
import searchingGuy from "../assets/searchingGuy.png";
import sleepyGuy from "../assets/sleepyGuy.png";
import swaggyGuy from "../assets/swaggyGuy.png";
import wizardGuy from "../assets/wizardGuy.png";

const AVATARS = [cowboyGuy, lilGuy, peakyGuy, searchingGuy, sleepyGuy, swaggyGuy, wizardGuy];

function getAvatar(id: number | string) {
  const n = typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(id);
  return AVATARS[Math.abs(n) % AVATARS.length];
}

export function CircleGuyAvatar({ id, size = 96 }: { id: number | string; size?: number }) {
  return (
    <img src={getAvatar(id)} alt="avatar" width={size} height={size} style={{ objectFit: "contain" }} />
  );
}
