import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const Info = styled.div`
  padding: 0.85rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 0.2rem;
  font-size: 0.95rem;
`;

const Author = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Genre = styled.p`
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const PriceRow = styled.div`
  margin-top: auto;
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Price = styled.span`
  font-weight: 700;
`;

export default function BookCard({ book }) {
  return (
    <Card to={`/product/${book.id}`}>
      <Image src={book.image} alt={book.title} loading="lazy" />
      <Info>
        <Title>{book.title}</Title>
        <Author>{book.author}</Author>
        <Genre>{book.genre}</Genre>
        <PriceRow>
          <FaShoppingCart aria-hidden />
          <Price>{book.price} €</Price>
        </PriceRow>
      </Info>
    </Card>
  );
}
