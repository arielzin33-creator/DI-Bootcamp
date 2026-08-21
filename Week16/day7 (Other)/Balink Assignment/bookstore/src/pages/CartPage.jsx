import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";
import { media } from "../styles/media";

const Page = styled.main`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  margin-top: 0;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.85rem 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Td = styled.td`
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
`;

const BookName = styled.p`
  margin: 0 0 0.25rem;
  font-weight: 700;
`;

const BookDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 420px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QtyButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  font-size: 1rem;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;

  ${media.mobile`flex-wrap: wrap; justify-content: space-between;`}
`;

const TotalLabel = styled.span`
  font-weight: 700;
`;

const NextButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.5rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BrowseLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

export default function CartPage() {
  const { items, total, setQuantity, removeItem } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Page>
        <Title>{t("cart.title")}</Title>
        <EmptyState>
          <p>{t("cart.empty")}</p>
          <BrowseLink to="/">{t("cart.browseBooks")}</BrowseLink>
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page>
      <Title>{t("cart.title")}</Title>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>{t("cart.name")}</Th>
              <Th>{t("cart.quantity")}</Th>
              <Th>{t("cart.price")}</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <Td>
                  <BookName>{item.title}</BookName>
                  <BookDescription>{item.description}</BookDescription>
                </Td>
                <Td>
                  <QuantityControl>
                    <QtyButton
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <FaMinus size={10} />
                    </QtyButton>
                    {item.quantity}
                    <QtyButton
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <FaPlus size={10} />
                    </QtyButton>
                  </QuantityControl>
                </Td>
                <Td>{(item.quantity * item.price).toFixed(2)} €</Td>
                <Td>
                  <DeleteButton
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title}`}
                  >
                    <FaTrash />
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <TotalRow>
          <TotalLabel>
            {t("cart.total")}: {total.toFixed(2)} €
          </TotalLabel>
          <NextButton type="button" onClick={() => navigate("/checkout")}>
            {t("cart.next")}
          </NextButton>
        </TotalRow>
      </TableWrapper>
    </Page>
  );
}
