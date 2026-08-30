import { useLocation, Navigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useI18n } from "../i18n/I18nContext";

const Page = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`;

const Congrats = styled.h1`
  font-weight: 500;
`;

const OrderId = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: monospace;
`;

const SeeYouAgain = styled.p`
  margin-top: 2rem;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

export default function ThanksPage() {
  const location = useLocation();
  const { t } = useI18n();
  const { orderId, firstName, lastName, storeName } = location.state || {};

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <Page>
      <Congrats>{t("thanks.congrats", { name: `${firstName} ${lastName}` })}</Congrats>
      <OrderId>
        {t("thanks.order")} {orderId}
      </OrderId>
      {storeName && <SeeYouAgain>{t("thanks.seeYouAgain", { store: storeName })}</SeeYouAgain>}
      <HomeLink to="/">{t("common.backHome")}</HomeLink>
    </Page>
  );
}
