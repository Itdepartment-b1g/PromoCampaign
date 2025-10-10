import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const RealtimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listen to realtime connection status
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', { event: 'connected' }, () => {
        setIsConnected(true);
      })
      .on('system', { event: 'disconnected' }, () => {
        setIsConnected(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  );
};

