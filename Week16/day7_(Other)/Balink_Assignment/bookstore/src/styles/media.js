import { css } from "styled-components";
import { theme } from "./theme";

// Usage inside a styled-component: ${media.tablet`grid-template-columns: 1fr;`}
export const media = {
  mobile: (...args) => css`
    @media (max-width: ${theme.breakpoints.mobile}) {
      ${css(...args)}
    }
  `,
  tablet: (...args) => css`
    @media (max-width: ${theme.breakpoints.tablet}) {
      ${css(...args)}
    }
  `,
  laptop: (...args) => css`
    @media (max-width: ${theme.breakpoints.laptop}) {
      ${css(...args)}
    }
  `,
};
