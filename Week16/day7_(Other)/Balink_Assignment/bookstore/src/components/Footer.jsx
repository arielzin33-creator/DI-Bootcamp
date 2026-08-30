import styled from "styled-components";
import { useI18n } from "../i18n/I18nContext";

const FooterBar = styled.footer`
  text-align: center;
  padding: 1.5rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
`;

export default function Footer() {
  const { t } = useI18n();
  return <FooterBar>{t("footer.rights")}</FooterBar>;
}
