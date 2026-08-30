import styled from "styled-components";
import { Link } from "react-router-dom";

const Card = styled(Link)`
  display: block;
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
  height: 160px;
  object-fit: cover;
`;

const Info = styled.div`
  padding: 1rem;
  text-align: center;
`;

const Name = styled.h3`
  margin: 0 0 0.35rem;
  font-size: 1rem;
`;

const Address = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function StoreCard({ store }) {
  return (
    <Card to={`/store/${store.id}`}>
      <Image src={store.image} alt={store.name} loading="lazy" />
      <Info>
        <Name>{store.name}</Name>
        <Address>{store.address}</Address>
        <Address>{store.city}</Address>
      </Info>
    </Card>
  );
}
