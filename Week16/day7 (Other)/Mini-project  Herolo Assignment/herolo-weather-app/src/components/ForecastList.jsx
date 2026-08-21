import { Card, CardContent, Typography, Box } from "@mui/material";
import { weatherIconFor } from "../api/weatherIcons";
import { formatTemperature } from "../utils/temperature";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ForecastList({ days, unit }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 1.5,
        mt: 2,
      }}
    >
      {days.map((day, index) => (
        <Card key={day.date} variant="outlined" sx={{ textAlign: "center" }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {index === 0 ? "Today" : DAY_LABELS[new Date(day.date).getDay()]}
            </Typography>
            <Typography sx={{ fontSize: "1.8rem", my: 0.5 }}>{weatherIconFor(day.dayIcon)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ minHeight: "2.5em" }}>
              {day.dayPhrase}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {formatTemperature(day.maxC, unit)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTemperature(day.minC, unit)}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
