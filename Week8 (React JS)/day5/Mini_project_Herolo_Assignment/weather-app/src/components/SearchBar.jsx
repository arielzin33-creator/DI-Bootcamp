import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { searchLocations } from "../api/weatherApi.js";

// Spec requires English-letters-only search input.
const ENGLISH_ONLY = /^[a-zA-Z\s'-]*$/;

export default function SearchBar({ onSelect, onError }) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    // Debounced so we don't fire a request on every keystroke — the
    // API is capped at 50 requests/day, so this matters more than usual.
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(inputValue.trim());
        setOptions(results);
      } catch {
        onError?.("Couldn't fetch location suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onError]);

  const handleInputChange = (event, value) => {
    if (ENGLISH_ONLY.test(value)) {
      setInputValue(value);
    }
  };

  return (
    <Autocomplete
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={(option) =>
        typeof option === "string"
          ? option
          : [option.name, option.adminArea, option.country]
              .filter(Boolean)
              .join(", ")
      }
      isOptionEqualToValue={(option, value) => option.key === value.key}
      onChange={(event, value) => {
        if (value) onSelect(value);
      }}
      noOptionsText={
        inputValue.length < 2 ? "Type at least 2 letters" : "No cities found"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a city"
          placeholder="e.g. Tel Aviv"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      fullWidth
    />
  );
}
