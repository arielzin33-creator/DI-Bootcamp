import { Card, CardActionArea, CardContent, Typography, Stack, Skeleton, Box } from "@mui/material";
import { useCurrentConditions } from "../api/queries";
import { weatherIconFor } from "../api/weatherIcons";
import { formatTemperature } from "../utils/temperature";
import { useAppStore } from "../store/useAppStore";
import FavoriteButton from "./FavoriteButton";

export default function FavoriteLocationCard({ location, onSelect }) {
  const { data: current, isLoading, isError } = useCurrentConditions(location.key);
  const unit = useAppStore((state) => state.unit);

  return (
    <Card elevation={2} sx={{ position: "relative" }}>
      {/* Positioned outside CardActionArea — nesting a <button> (IconButton)
          inside another <button> (CardActionArea) is invalid HTML and triggers
          a React hydration warning. */}
      <Box sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}>
        <FavoriteButton location={location} size="small" />
      </Box>

      <CardActionArea onClick={() => onSelect(location)}>
        <CardContent>
          <Box sx={{ pr: 4 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {location.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {location.key}
            </Typography>
          </Box>

          {isLoading && <Skeleton variant="text" width={100} height={40} sx={{ mt: 1 }} />}
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Couldn't load weather.
            </Typography>
          )}
          {current && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
              <Typography sx={{ fontSize: "2rem" }}>{weatherIconFor(current.icon)}</Typography>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatTemperature(current.temperatureC, unit)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {current.weatherText}
                </Typography>
              </Box>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
