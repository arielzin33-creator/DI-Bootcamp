import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import StoreCard from "../components/StoreCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { fetchStores } from "../api/apiClient";
import { useI18n } from "../i18n/I18nContext";
import { media } from "../styles/media";

const Page = styled.main`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;

  ${media.mobile`grid-template-columns: 1fr;`}
`;

export default function HomePage() {
  const { t } = useI18n();
  const [stores, setStores] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setStores(null);
    fetchStores()
      .then(setStores)
      .catch(() => setError(t("common.error")));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page>
      <Subtitle>{t("home.subtitle")}</Subtitle>
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!error && !stores && <Loader />}
      {!error && stores && (
        <Grid>
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </Grid>
      )}
    </Page>
  );
}
