import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import styled from "styled-components";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nContext";
import { createOrder } from "../api/apiClient";
import { MOCK_STORES } from "../api/mockData";

const Page = styled.main`
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  font-weight: 500;
  margin-top: 0;
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;

  & > * {
    flex: 1;
  }
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: 6px;
  font-size: 0.9rem;
`;

const FieldError = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const SubmitError = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  font-size: 0.85rem;
`;

const BuyButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const FIELDS = ["firstName", "lastName", "address", "phoneNumber"];

export default function FinalizeOrderPage() {
  const { items, total, clearCart } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: "", lastName: "", address: "", phoneNumber: "" });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Captured once via the lazy useState initializer, not read live: a
  // successful submit empties the cart via clearCart() *before* the
  // navigate("/thanks") call below has taken the page away, which would
  // otherwise make this guard fire mid-submit and redirect to /cart instead
  // of /thanks. Only an empty cart at the moment this page was first opened
  // (e.g. a direct link or a refresh) should trigger the redirect.
  const [startedEmpty] = useState(() => items.length === 0);
  if (startedEmpty) {
    return <Navigate to="/cart" replace />;
  }

  const errors = FIELDS.reduce((acc, field) => {
    if (!form[field].trim()) acc[field] = t("finalize.required");
    return acc;
  }, {});
  const isValid = Object.keys(errors).length === 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(event) {
    setTouched((prev) => ({ ...prev, [event.target.name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((field) => [field, true])));
    if (!isValid) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const orderedBooks = items.map((item) => ({
        bookId: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      }));

      const storeId = items[0]?.storeId;
      const store = MOCK_STORES.find((s) => s.id === storeId);

      const { id } = await createOrder({
        address: form.address,
        amount: total,
        books: orderedBooks,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      clearCart();
      navigate("/thanks", {
        replace: true,
        state: {
          orderId: id,
          firstName: form.firstName,
          lastName: form.lastName,
          storeName: store?.name,
        },
      });
    } catch {
      setSubmitError(t("finalize.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Card onSubmit={handleSubmit} noValidate>
        <Title>{t("finalize.title")}</Title>

        <Row>
          <Field>
            <Input
              name="firstName"
              placeholder={t("finalize.firstName")}
              value={form.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              $invalid={touched.firstName && errors.firstName}
            />
            {touched.firstName && errors.firstName && <FieldError>{errors.firstName}</FieldError>}
          </Field>
          <Field>
            <Input
              name="lastName"
              placeholder={t("finalize.lastName")}
              value={form.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              $invalid={touched.lastName && errors.lastName}
            />
            {touched.lastName && errors.lastName && <FieldError>{errors.lastName}</FieldError>}
          </Field>
        </Row>

        <Field>
          <Input
            name="address"
            placeholder={t("finalize.address")}
            value={form.address}
            onChange={handleChange}
            onBlur={handleBlur}
            $invalid={touched.address && errors.address}
          />
          {touched.address && errors.address && <FieldError>{errors.address}</FieldError>}
        </Field>

        <Field>
          <Input
            name="phoneNumber"
            placeholder={t("finalize.phoneNumber")}
            value={form.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            $invalid={touched.phoneNumber && errors.phoneNumber}
          />
          {touched.phoneNumber && errors.phoneNumber && (
            <FieldError>{errors.phoneNumber}</FieldError>
          )}
        </Field>

        {submitError && <SubmitError>{submitError}</SubmitError>}

        <BuyButton type="submit" disabled={submitting}>
          {submitting ? t("finalize.submitting") : t("finalize.buy")}
        </BuyButton>
      </Card>
    </Page>
  );
}
