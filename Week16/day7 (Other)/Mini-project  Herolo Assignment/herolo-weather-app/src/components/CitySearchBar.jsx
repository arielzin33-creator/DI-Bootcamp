import { useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCityAutocomplete } from "../api/queries";
import { isEnglishCityQuery } from "../utils/validateCityQuery";

export default function CitySearchBar({ onSelectCity }) {
  const [inputValue, setInputValue] = useState("");
  const debouncedInput = useDebouncedValue(inputValue);
  const invalidLanguage = inputValue.length > 0 && !isEnglishCityQuery(inputValue);

  const { data: options = [], isFetching } = useCityAutocomplete(debouncedInput);

  return (
    <Autocomplete
      fullWidth
      filterOptions={(x) => x} // server/mock already filters — don't re-filter client-side
      options={options}
      getOptionLabel={(city) => `${city.name}, ${city.country}`}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      loading={isFetching}
      inputValue={inputValue}
      onInputChange={(_event, value) => setInputValue(value)}
      onChange={(_event, city) => {
        if (city) onSelectCity(city);
      }}
      noOptionsText={
        invalidLanguage ? "Please search using English letters only" : "No cities found"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a city"
          placeholder="e.g. Tel Aviv, London, Tokyo"
          error={invalidLanguage}
          helperText={invalidLanguage ? "English letters only, please." : " "}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {isFetching ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
