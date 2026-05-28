import { Calendar, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { openExternalLink } from "@/actions/shell";
import { apiFetch } from "@/services/api-client";
import { Button } from "../../ui/button";

interface CalendarConnectButtonProps {
  className?: string;
  isConnected?: boolean;
  isConnecting?: boolean;
  onConnected?: () => void;
}

export function CalendarConnectButton({
  isConnected = false,
  isConnecting = false,
  onConnected,
  className,
}: CalendarConnectButtonProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleConnect = async () => {
    if (isConnected || isConnecting || isOpening) {
      return;
    }

    setIsOpening(true);
    try {
      const res = await apiFetch("/integrations/google/connect");
      const data = (await res.json()) as { authUrl?: string };
      if (data.authUrl) {
        openExternalLink(data.authUrl);
      }
      onConnected?.();
    } catch (error) {
      console.error("Failed to open calendar connection:", error);
    } finally {
      setTimeout(() => setIsOpening(false), 1000);
    }
  };

  if (isConnected) {
    return (
      <Button className={className} disabled size="sm" variant="outline">
        <CheckCircle className="mr-1.5 text-green-500" size={14} />
        Calendar Connected
      </Button>
    );
  }

  return (
    <Button
      className={className}
      disabled={isConnecting || isOpening}
      onClick={handleConnect}
      size="sm"
      variant={isConnecting ? "secondary" : "default"}
    >
      {isConnecting || isOpening ? (
        <>
          <Loader2 className="mr-1.5 animate-spin" size={14} />
          Connecting...
        </>
      ) : (
        <>
          <Calendar className="mr-1.5" size={14} />
          <ExternalLink className="mr-1" size={14} />
          Connect Google Calendar
        </>
      )}
    </Button>
  );
}
