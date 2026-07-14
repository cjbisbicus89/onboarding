import React from "react";
import { render } from "@testing-library/react-native";
import CheckoutScreen from "./checkout.screen";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Mock dependencies
jest.mock("lucide-react-native", () => ({
  Trash2: "Trash2",
  Plus: "Plus",
  Minus: "Minus",
  CreditCard: "CreditCard",
  ArrowLeft: "ArrowLeft",
}));

jest.mock("../../store/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({
    cart: { items: [], totalAmountCentavos: 0, itemCount: 0 },
    customer: { email: "", fullName: "" },
  }),
}));

// Mock components that might cause issues
jest.mock("../../components/ui/backdrop.component", () => ({
  Backdrop: ({ children }: any) => children,
}));
jest.mock("./components/card-form.component", () => ({
  CardFormComponent: "CardFormComponent",
}));
jest.mock("./components/customer-form.component", () => ({
  CustomerFormComponent: "CustomerFormComponent",
}));
jest.mock("./components/payment-summary.component", () => ({
  PaymentSummaryComponent: "PaymentSummaryComponent",
}));
jest.mock("../../components/shared/toast.component", () => ({
  Toast: "Toast",
  useToast: () => ({ toast: null, show: jest.fn() }),
}));

describe("CheckoutScreen", () => {
  it("renders empty cart message", () => {
    const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const { getByText } = render(<CheckoutScreen navigation={mockNavigation} />);
    expect(getByText("Tu carrito está vacío")).toBeTruthy();
  });
});