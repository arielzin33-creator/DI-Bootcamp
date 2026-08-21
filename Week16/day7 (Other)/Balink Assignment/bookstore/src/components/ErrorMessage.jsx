import styled from "styled-components";
import { useI18n } from "../i18n/I18nContext";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.danger};
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
`;

export default function ErrorMessage({ message, onRetry }) {
  const { t } = useI18n();
  return (
    <Wrapper>
      <p>{message || t("common.error")}</p>
      {onRetry && (
        <RetryButton type="button" onClick={onRetry}>
          {t("common.retry")}
        </RetryButton>
      )}
    </Wrapper>
  );
}
