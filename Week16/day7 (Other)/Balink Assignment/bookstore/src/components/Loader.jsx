import styled, { keyframes } from "styled-components";
import { useI18n } from "../i18n/I18nContext";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export default function Loader() {
  const { t } = useI18n();
  return (
    <Wrapper>
      <Spinner />
      <span>{t("common.loading")}</span>
    </Wrapper>
  );
}
