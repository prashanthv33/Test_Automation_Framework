import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '@components/ProductCard';
import { BasePage } from './BasePage';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/** Step one: customer information form. */
export class CheckoutInfoPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  protected readonly readyLocator: Locator;

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.errorMessage = page.getByTestId('error');
    this.readyLocator = page.getByTestId('checkout-info-container');
  }

  async fill(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
  }

  async submit(info: Partial<CustomerInfo>): Promise<void> {
    await this.fill(info);
    await this.continueButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }
}

/** Step two: order overview with price breakdown. */
export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';
  protected readonly readyLocator: Locator;

  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemPrices = page.getByTestId('cart-list').getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.readyLocator = page.getByTestId('checkout-summary-container');
  }

  async totals(): Promise<OrderTotals> {
    return {
      subtotal: parsePrice(await this.subtotalLabel.innerText()),
      tax: parsePrice(await this.taxLabel.innerText()),
      total: parsePrice(await this.totalLabel.innerText()),
    };
  }

  async sumOfItemPrices(): Promise<number> {
    const prices = (await this.itemPrices.allInnerTexts()).map(parsePrice);
    return round2(prices.reduce((a, b) => a + b, 0));
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}

/** Final confirmation page. */
export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';
  protected readonly readyLocator: Locator;

  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
    this.readyLocator = page.getByTestId('checkout-complete-container');
  }
}

export const round2 = (n: number): number => Math.round(n * 100) / 100;
