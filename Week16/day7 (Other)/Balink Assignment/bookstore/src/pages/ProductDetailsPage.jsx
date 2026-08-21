import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import StarRating from "../components/StarRating";
import { fetchBook } from "../api/apiClient";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useI18n } from "../i18n/I18nContext";
import { media } from "../styles/media";

const Page = styled.main`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2.5rem;
  align-items: start;

  ${media.tablet`
    grid-template-columns: 1fr;
  `}
`;

const Main = styled.div``;

const Title = styled.h1`
  margin: 0 0 0.25rem;
`;

const By = styled.p`
  margin: 0 0 0.5rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Description = styled.div`
  margin: 1.5rem 0;
  line-height: 1.6;
  white-space: pre-line;
`;

const DetailsBox = styled.div`
  h2 {
    font-size: 1rem;
  }
`;

const DetailRow = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;

  strong {
    display: inline-block;
    min-width: 100px;
  }
`;

const BuyPanel = styled.aside`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 1.5rem;
  position: sticky;
  top: 90px;

  ${media.tablet`position: static;`}
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Price = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
`;

const AltNote = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 1.25rem;
`;

const AddButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export default function ProductDetailsPage() {
  const { bookId } = useParams();
  const { t } = useI18n();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setBook(null);
    fetchBook(bookId)
      .then(setBook)
      .catch(() => setError(t("common.error")));
  }, [bookId, t]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAddToCart() {
    addItem(book);
    showToast(t("product.addedToCart"));
  }

  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!book) return <Loader />;

  return (
    <Page>
      <Main>
        <Title>{book.title}</Title>
        <By>
          {t("product.by")} {book.author}
        </By>
        <StarRating rating={book.rating} count={book.ratingsCount} label={t("product.ratings")} />

        <Description>{book.description}</Description>

        <DetailsBox>
          <h2>{t("product.details")}</h2>
          <DetailRow>
            <strong>{t("product.publisher")}:</strong> {book.publisher}
          </DetailRow>
          <DetailRow>
            <strong>{t("product.language")}:</strong> {book.language}
          </DetailRow>
          <DetailRow>
            <strong>{t("product.paperback")}:</strong> {book.paperback}
          </DetailRow>
        </DetailsBox>
      </Main>

      <BuyPanel>
        <PriceRow>
          <span>{t("product.buy")}:</span>
          <Price>{book.price} €</Price>
        </PriceRow>
        <AltNote>{t("product.alternativeNote")}</AltNote>
        <AddButton type="button" onClick={handleAddToCart}>
          {t("product.addToCart")}
        </AddButton>
      </BuyPanel>
    </Page>
  );
}
