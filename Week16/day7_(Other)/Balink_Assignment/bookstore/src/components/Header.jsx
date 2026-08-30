import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBookOpen } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";
import { LANGUAGES } from "../i18n/translations";
import { media } from "../styles/media";

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;

  ${media.tablet`padding: 0.75rem 1rem;`}
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const LangGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const LangButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.textMuted)};
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
`;

const CartLink = styled(Link)`
  position: relative;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -10px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Header() {
  const { itemCount } = useCart();
  const { lang, setLang, t } = useI18n();

  return (
    <Bar>
      <Logo to="/">
        <FaBookOpen aria-hidden />
        {t("app.name")}
      </Logo>
      <Actions>
        <LangGroup>
          {LANGUAGES.map((language) => (
            <LangButton
              key={language.code}
              type="button"
              $active={lang === language.code}
              onClick={() => setLang(language.code)}
              aria-pressed={lang === language.code}
            >
              {language.label}
            </LangButton>
          ))}
        </LangGroup>
        <CartLink to="/cart" aria-label="Cart">
          <FaShoppingCart />
          {itemCount > 0 && <Badge>{itemCount}</Badge>}
        </CartLink>
      </Actions>
    </Bar>
  );
}
