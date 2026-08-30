import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getCurrentConditions } from "../api/weatherApi.js";
import ErrorToast from "../components/ErrorToast.jsx";

export default function FavoritesPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [weatherByKey, setWeatherByKey] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      for (const favorite of state.favorites) {
        try {
          const current = await getCurrentConditions(favorite.key);
          if (!cancelled) {
            setWeatherByKey((prev) => ({ ...prev, [favorite.key]: current }));
          }
        } catch {
          if (!cancelled) {
            setError("Couldn't refresh weather for one or more favorites.");
          }
        }
      }
    }

    if (state.favorites.length > 0) loadAll();
    return () => {
      cancelled = true;
    };
    // Only re-fetch when the list of favorites itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.favorites]);

  const handleOpen = (favorite) => {
    navigate("/", { state: { location: favorite } });
  };

  const handleRemove = (event, key) => {
    event.stopPropagation();
    dispatch({ type: "REMOVE_FAVORITE", payload: { key } });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Favorites
      </Typography>

      {state.favorites.length === 0 ? (
        <Typography color="text.secondary">
          No favorites yet. Add a city from the weather page.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {state.favorites.map((favorite) => {
            const weather = weatherByKey[favorite.key];
            const temperature =
              weather &&
              Math.round(
                state.units === "C" ? weather.temperatureC : weather.temperatureF
              );

            return (
              <Grid item xs={12} sm={6} md={4} key={favorite.key}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardActionArea onClick={() => handleOpen(favorite)}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <div>
                          <Typography variant="h6">{favorite.name}</Typography>
                          {favorite.country && (
                            <Typography variant="body2" color="text.secondary">
                              {favorite.country}
                            </Typography>
                          )}
                        </div>
                        <IconButton
                          size="small"
                          onClick={(e) => handleRemove(e, favorite.key)}
                          aria-label={`Remove ${favorite.name} from favorites`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Typography variant="h4" sx={{ mt: 2 }}>
                        {temperature !== undefined
                          ? `${temperature}\u00b0${state.units}`
                          : "\u2014"}
                      </Typography>
                      {weather && (
                        <Typography variant="body2" color="text.secondary">
                          {weather.weatherText}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ErrorToast message={error} onClose={() => setError(null)} />
    </Container>
  );
}
