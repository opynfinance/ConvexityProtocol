export function checkVault(
  vault: any,
  expectedCollateral: string,
  oTokensIssued: string
): void {
  expect(vault['0'].toString()).to.equal(expectedCollateral);
  expect(vault['1'].toString()).to.equal(oTokensIssued);
}

export function calculateMaxOptionsToCreate(
  collateral: number,
  collateralToStrikePrice: number,
  minCollateralizationRatio: number,
  strikePrice: number
): number {
  return Math.floor(
    (collateral * collateralToStrikePrice) /
      (minCollateralizationRatio * strikePrice)
  );
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
