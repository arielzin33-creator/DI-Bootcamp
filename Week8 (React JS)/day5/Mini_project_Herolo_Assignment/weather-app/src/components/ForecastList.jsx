import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useApp } from "../context/AppContext.jsx";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

export default function ForecastList({ days }) {
  const { state } = useApp();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: "12px",
      }}
    >
      {days.map((day) => {
        const min = Math.round(state.units === "C" ? day.minC : day.minF);
        const max = Math.round(state.units === "C" ? day.maxC : day.maxF);

        return (
          <Card key={day.date} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2">
                {WEEKDAY_FORMATTER.format(new Date(day.date))}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                title={day.phrase}
              >
                {day.phrase}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {max}&deg; / {min}&deg;
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
