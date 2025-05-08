import { AppBar, Toolbar, Typography } from "@mui/material";
// import { useTranslation } from "../contexts/Translation";

export const Header = () => {
//   const { language, setLanguage } = useTranslation();

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
      </Toolbar>
    </AppBar>
  );
};