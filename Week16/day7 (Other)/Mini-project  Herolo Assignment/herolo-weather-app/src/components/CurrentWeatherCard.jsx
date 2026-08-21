import { Card, CardContent, Typography, Stack, Chip, Box } from "@mui/material";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { weatherIconFor } from "../api/weatherIcons";
import { formatTemperature } from "../utils/temperature";
import FavoriteButton from "./FavoriteButton";

export default function CurrentWeatherCard({ location, current, unit }) {
  return (
    <Card elevation={3} sx={{ overflow: "visible" }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {location.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {location.adminArea ? `${location.adminArea}, ` : ""}
              {location.country}
            </Typography>
          </Box>
          <FavoriteButton location={location} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: "center" }}>
          <Typography sx={{ fontSize: "4rem", lineHeight: 1 }}>
            {weatherIconFor(current.icon)}
          </Typography>
          <Box>
            <Typography variant="h2" fontWeight={700}>
              {formatTemperature(current.temperatureC, unit)}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {current.weatherText}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap" }} useFlexGap>
          <Chip
            icon={<ThermostatIcon />}
            label={`Feels like ${formatTemperature(current.realFeelC, unit)}`}
            variant="outlined"
          />
          <Chip icon={<WaterDropIcon />} label={`Humidity ${current.humidity}%`} variant="outlined" />
          <Chip icon={<AirIcon />} label={`Wind ${Math.round(current.windKmh)} km/h`} variant="outlined" />
        </Stack>
      </CardContent>
    </Card>
  );
}
