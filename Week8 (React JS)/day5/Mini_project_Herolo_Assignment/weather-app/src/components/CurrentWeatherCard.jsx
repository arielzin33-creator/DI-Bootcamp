import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useApp } from "../context/AppContext.jsx";

export default function CurrentWeatherCard({ location, current }) {
  const { state, dispatch } = useApp();
  const isFavorite = state.favorites.some((f) => f.key === location.key);

  const temperature = Math.round(
    state.units === "C" ? current.temperatureC : current.temperatureF
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: "REMOVE_FAVORITE", payload: { key: location.key } });
    } else {
      dispatch({
        type: "ADD_FAVORITE",
        payload: {
          key: location.key,
          name: location.name,
          country: location.country,
        },
      });
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <div>
            <Typography variant="h5">{location.name}</Typography>
            {location.country && (
              <Typography variant="body2" color="text.secondary">
                {location.country}
              </Typography>
            )}
          </div>

          <IconButton
            onClick={toggleFavorite}
            color="error"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mt: 2, flexWrap: "wrap" }}
        >
          <Typography variant="h2" sx={{ fontWeight: 500 }}>
            {temperature}&deg;{state.units}
          </Typography>
          <Chip label={current.weatherText} color="primary" variant="outlined" />
        </Stack>
      </CardContent>
    </Card>
  );
}
