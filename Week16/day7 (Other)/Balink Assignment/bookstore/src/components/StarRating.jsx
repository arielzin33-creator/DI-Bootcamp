import styled from "styled-components";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: ${({ theme }) => theme.colors.star};
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
`;

export default function StarRating({ rating, count, label }) {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    if (rating >= position) return <FaStar key={position} />;
    if (rating >= position - 0.5) return <FaStarHalfAlt key={position} />;
    return <FaRegStar key={position} />;
  });

  return (
    <Wrapper>
      {stars}
      {count !== undefined && (
        <Count>
          ({count} {label})
        </Count>
      )}
    </Wrapper>
  );
}
