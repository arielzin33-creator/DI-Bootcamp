import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { fetchBooks, fetchStores } from "../api/apiClient";
import { useI18n } from "../i18n/I18nContext";
import { media } from "../styles/media";

const Page = styled.main`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

const Breadcrumb = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 600;
`;

const Heading = styled.h1`
  margin: 0.5rem 0 0.25rem;
`;

const SubHeading = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;

  ${media.mobile`grid-template-columns: repeat(2, 1fr);`}
`;

export default function StorePage() {
  const { storeId } = useParams();
  const { t } = useI18n();
  const [store, setStore] = useState(null);
  const [books, setBooks] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setStore(null);
    setBooks(null);
    Promise.all([fetchStores(), fetchBooks()])
      .then(([allStores, allBooks]) => {
        setStore(allStores.find((s) => s.id === storeId) ?? null);
        setBooks(allBooks.filter((book) => book.storeId === storeId));
      })
      .catch(() => setError(t("common.error")));
  }, [storeId, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page>
      <Breadcrumb to="/">← {t("store.backToStores")}</Breadcrumb>
      {store && (
        <>
          <Heading>{store.name}</Heading>
          <SubHeading>
            {store.address}, {store.city}
          </SubHeading>
        </>
      )}

      {error && <ErrorMessage message={error} onRetry={load} />}
      {!error && !books && <Loader />}
      {!error && books && books.length === 0 && <p>{t("store.noBooks")}</p>}
      {!error && books && books.length > 0 && (
        <Grid>
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </Grid>
      )}
    </Page>
  );
}
