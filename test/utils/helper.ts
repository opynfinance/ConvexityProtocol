export function checkVault(
  vault: any,
  expectedCollateral: string,
  oTokensIssued: string
): void {
  expect(vault['0'].toString()).to.equal(expectedCollateral);
  expect(vault['1'].toString()).to.equal(oTokensIssued);
}
