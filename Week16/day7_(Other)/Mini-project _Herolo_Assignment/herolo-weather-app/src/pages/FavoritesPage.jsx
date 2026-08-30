import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Stack } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useAppStore } from "../store/useAppStore";
import FavoriteLocationCard from "../components/FavoriteLocationCard";

export default function FavoritesPage() {
  const favorites = useAppStore((state) => state.favorites);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);
  const navigate = useNavigate();

  function handleSelect(location) {
    setSelectedLocation(location);
    navigate("/");
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Favorite Locations
      </Typography>

      {favorites.length === 0 ? (
        <Stack spacing={1} sx={{ py: 8, color: "text.secondary", alignItems: "center" }}>
          <StarBorderIcon sx={{ fontSize: 48 }} />
          <Typography>No favorites yet.</Typography>
          <Typography variant="body2">
            Search for a city on the Home page and tap the heart to save it here.
          </Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 2,
          }}
        >
          {favorites.map((location) => (
            <FavoriteLocationCard key={location.key} location={location} onSelect={handleSelect} />
          ))}
        </Box>
      )}
    </Container>
  );
}
