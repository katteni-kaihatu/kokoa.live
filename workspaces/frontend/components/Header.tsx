import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useApplication } from "@/contexts/Application";
// import { useTranslation } from "../contexts/Translation";

export const Header = () => {
  //   const { language, setLanguage } = useTranslation();
  const { loggedIn, logout } = useApplication();

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar variant="dense">
        <Typography
          variant="h6"
          color="inherit"
          component="div"
          sx={{ flexGrow: 1 }}
        >
          KOKOLIVE &nbsp;
          <Typography variant="subtitle2" display="inline">
            via Resonite.Love
          </Typography>
        </Typography>
        {/* <LanguageButton language={language} setLanguage={setLanguage} /> */}
        {loggedIn && (
          <Button color="primary" onClick={logout} variant="outlined">
            ログアウト
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
