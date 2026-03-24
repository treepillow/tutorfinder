import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { Heart } from "lucide-react";

interface MatchDialogProps {
  profile: any;
  onClose: () => void;
}

export function MatchDialog({ profile, onClose }: MatchDialogProps) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#7C8D8C", "#C9B08E", "#E9D8BB"],
    });
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#FFF2D5] border-[#C9B08E]">
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-[#7C8D8C] rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          
          <div>
            <h2 className="text-3xl tracking-tight text-[#2F3B3D] mb-2">
              It's a Match!
            </h2>
            <p className="text-[#2F3B3D]/70">
              You and {profile.name} have matched
            </p>
          </div>

          <div className="aspect-square w-32 mx-auto bg-gradient-to-br from-[#C9B08E] to-[#7C8D8C] rounded-full flex items-center justify-center">
            <div className="text-6xl">{profile.gender === "Female" ? "👩" : "👨"}</div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
          >
            Continue Swiping
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
