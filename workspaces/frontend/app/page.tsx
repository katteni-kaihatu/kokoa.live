'use client';

import { useApplication } from "@/contexts/Application";
import { useApi } from "@/contexts/Api";
import { Header } from "../components/Header";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import IconButton from "@mui/icons-material/Refresh";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ObsInfoPanel } from "../components/ObsInfoPanel";

export default function Home() {
  const app = useApplication();
  const api = useApi();
  const router = useRouter();
  
  const [iframeKey, setIframeKey] = useState(0);

  // ログインボタン押下時
  const handleLogin = () => {
    window.location.href = `https://auth.resonite.love?link=${window.location.origin}&linkType=REDIRECT`;
  };

  // RLTokenがクエリにある場合の処理
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const RLToken = url.searchParams.get("RLToken");
    if (RLToken) {
      url.searchParams.delete("RLToken");
      window.history.replaceState(null, "", url.toString());
      api.login(RLToken).then((result: boolean) => {
        if (result) {
          const redirectPath = localStorage.getItem("redirectPath");
          if (redirectPath) {
            localStorage.removeItem("redirectPath");
            router.push(redirectPath);
          } else {
            window.location.href = "/";
          }
        }
      });
    }
  }, [api, router]);

  if (!app.appReady) return <></>;

  if (app.loggedIn) {

    return (
      <>
        <Header />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 4,
            my: 4,
            mx: "auto",
            width: "100%",
            maxWidth: 1100,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper
              elevation={3}
              sx={{
                border: "2px solid #ff8800",
                borderRadius: 2,
                p: 2,
                mb: 4,
                position: "relative",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  ライブプレビュー
                </Typography>
                <IconButton
                  aria-label="再読み込み"
                  onClick={() => setIframeKey(k => k + 1)}
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  overflow: "hidden",
                  width: "100%",
                  position: "relative",
                  aspectRatio: "16 / 9",
                  mb: 1,
                }}
              >
                <iframe
                  key={iframeKey}
                  src="https://kokolive.kokoa.dev/live/kokoa/"
                  style={{
                    border: "none",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  allow="autoplay; fullscreen"
                />
              </Box>
            </Paper>
            <Paper
              elevation={3}
              sx={{
                border: "2px solid #ff8800",
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
              component="form"
              onSubmit={e => { e.preventDefault(); /* ダミー */ }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                次の番組情報を設定する(15分間表示されます)
              </Typography>
              <TextField
                label="タイトル"
                name="title"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
              />
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  サムネイル
                </Typography>
                <Input
                  type="file"
                  name="thumbnail"
                  inputProps={{ accept: "image/*" }}
                  fullWidth
                />
              </Box>
              <TextField
                label="説明"
                name="description"
                variant="outlined"
                size="small"
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: "#ff8800",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: 1,
                    px: 3,
                    "&:hover": { background: "#ff9900" },
                  }}
                >
                  送信
                </Button>
              </Box>
            </Paper>
          </Box>
          <ObsInfoPanel />
        </Box>
      </>
    );
  }

  // 未ログイン時
  return (
    <Box>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          ログイン
        </Typography>
        <Button variant="contained" onClick={handleLogin}>
          Resonite.loveでログイン
        </Button>
      </Box>
    </Box>
  );
}
