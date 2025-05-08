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


  const [liveStatus, setLiveStatus] = useState<{ name: string; description: string; iconUrl?: string } | null>(null);

  useEffect(() => {
    api.getLiveStatus().then(setLiveStatus);
  }, [api]);

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
              onSubmit={async e => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const title = formData.get("title") as string;
                const description = formData.get("description") as string;
                const file = formData.get("thumbnail") as File | null;

                let iconUrl = "";

                if (file && file.type.startsWith("image/")) {
                  // 画像をリサイズしてbase64化
                  const img = document.createElement("img");
                  const reader = new FileReader();
                  const loadImage = () =>
                    new Promise<HTMLImageElement>((resolve, reject) => {
                      reader.onload = () => {
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = reader.result as string;
                      };
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });

                  try {
                    const loadedImg = await loadImage();
                    // 目標40KB程度: 画像サイズを縮小し、品質も調整
                    const maxSize = 300; // px, 目安
                    const canvas = document.createElement("canvas");
                    const scale = Math.min(
                      1,
                      maxSize / Math.max(loadedImg.width, loadedImg.height)
                    );
                    canvas.width = Math.round(loadedImg.width * scale);
                    canvas.height = Math.round(loadedImg.height * scale);
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.drawImage(
                        loadedImg,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                      );
                      // 40KB目標で品質を調整
                      let quality = 0.7;
                      let dataUrl = "";
                      for (let i = 0; i < 5; i++) {
                        dataUrl = canvas.toDataURL("image/jpeg", quality);
                        // base64部分のバイト数
                        const base64Length = dataUrl.length - dataUrl.indexOf(",") - 1;
                        const byteLength = Math.floor(base64Length * 3 / 4);
                        if (byteLength <= 40960) break;
                        quality -= 0.15;
                        if (quality < 0.3) break;
                      }
                      iconUrl = dataUrl;
                    }
                  } catch (err) {
                    // 画像処理失敗時はiconUrl空
                    iconUrl = "";
                  }
                }

                await api.setLiveStatus({
                  name: title,
                  description,
                  iconUrl,
                });
                // 送信後に現在の情報を再取得
                api.getLiveStatus().then(setLiveStatus);
                // 送信後のUI更新や通知は必要に応じて追加
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                次の番組情報を設定する
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
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    await api.deleteLiveStatus();
                    api.getLiveStatus().then(setLiveStatus);
                  }}
                  sx={{
                    fontWeight: "bold",
                    borderRadius: 1,
                    px: 3,
                  }}
                >
                  クリア
                </Button>
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
          <Box>
            <ObsInfoPanel />
            {/* 現在の番組情報表示（OBS接続情報の下） */}
            <Paper
              elevation={2}
              sx={{
                border: "2px solid #1976d2",
                borderRadius: 2,
                p: 2,
                mt: 2,
                background: "#f7fafd",
                maxWidth: 320,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                現在の番組情報
              </Typography>
              {liveStatus ? (
                <>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    タイトル: {liveStatus.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    説明: {liveStatus.description}
                  </Typography>
                  {liveStatus.iconUrl && liveStatus.iconUrl !== "" && (
                    <Box sx={{ mb: 1 }}>
                      <img src={liveStatus.iconUrl} alt="サムネイル" style={{ maxWidth: 120, borderRadius: 4 }} />
                    </Box>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  番組情報は未設定です
                </Typography>
              )}
            </Paper>
          </Box>
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
