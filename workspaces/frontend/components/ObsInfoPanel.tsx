import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { useState } from "react";

const OBS_RESOLUTION = "1920x1080";
const OBS_URL = "rtmp://live.kokoa.dev/";
const OBS_STREAM_KEY = "stream1";

export function ObsInfoPanel() {
  const [copied, setCopied] = useState<null | "url" | "key">(null);

  const handleCopy = (text: string, type: "url" | "key") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        border: "2px solid #1976d2",
        borderRadius: 2,
        p: 2,
        minWidth: 280,
        maxWidth: 320,
        ml: { xs: 0, md: 4 },
        mt: { xs: 4, md: 0 },
        background: "#f7fafd",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}>
        OBS接続情報
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>解像度</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>{OBS_RESOLUTION}</Typography>
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>接続先</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ wordBreak: "break-all" }}>{OBS_URL}</Typography>
          <IconButton
            size="small"
            onClick={() => handleCopy(OBS_URL, "url")}
            sx={{ ml: 1 }}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </Box>
        {copied === "url" && (
          <Typography variant="caption" color="success.main">コピーしました</Typography>
        )}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>ストリームキー</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ wordBreak: "break-all" }}>{OBS_STREAM_KEY}</Typography>
          <IconButton
            size="small"
            onClick={() => handleCopy(OBS_STREAM_KEY, "key")}
            sx={{ ml: 1 }}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </Box>
        {copied === "key" && (
          <Typography variant="caption" color="success.main">コピーしました</Typography>
        )}
      </Box>
    </Paper>
  );
}
