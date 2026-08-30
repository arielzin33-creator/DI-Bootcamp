import { IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useSnackbar } from "notistack";
import { useAppStore } from "../store/useAppStore";

export default function FavoriteButton({ location, size = "medium" }) {
  const isFavorite = useAppStore((state) => state.isFavorite(location.key));
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const { enqueueSnackbar } = useSnackbar();

  function handleClick(event) {
    event.stopPropagation();
    toggleFavorite(location);
    enqueueSnackbar(
      isFavorite ? `Removed ${location.name} from favorites` : `Added ${location.name} to favorites`,
      { variant: "success", autoHideDuration: 2000 }
    );
  }

  return (
    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
      <IconButton onClick={handleClick} color="secondary" size={size} aria-label="toggle favorite">
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}
